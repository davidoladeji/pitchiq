import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { DeckInput } from "@/lib/types";
import { getPlanLimits } from "@/lib/plan-limits";
import { planGeneration, executeGeneration } from "@/lib/generation/coordinator";
import type { GenerationProgressEvent } from "@/lib/generation/skills/types";
import { scoreDeck } from "@/lib/piq-score";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const body: DeckInput & { enableSkills?: boolean } = await req.json();
  if (!body.companyName || !body.problem || !body.solution) {
    return new Response(JSON.stringify({ error: "Company name, problem, and solution required" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const userPlan = user?.plan || "starter";
  const limits = getPlanLimits(userPlan);

  // Validate theme
  if (body.themeId && !limits.allowedThemes.includes(body.themeId)) {
    body.themeId = "midnight";
  }

  // Determine if skills should be enabled
  const enableSkills = body.enableSkills !== false && userPlan !== "starter";

  // Create generation job record
  const job = await prisma.generationJob.create({
    data: { userId, status: "running", input: JSON.stringify(body), startedAt: new Date() },
  });

  // SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: GenerationProgressEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        let slides;
        let generationMeta: string | undefined;
        let critiqueResults: string | undefined;
        let skillResults: string | undefined;

        if (enableSkills) {
          // Full skill pipeline
          const plan = planGeneration(body, {
            hasWebSearch: false,
            hasImageGen: !!process.env.UNSPLASH_ACCESS_KEY,
            planTier: userPlan,
          });

          const result = await executeGeneration(body, plan, userPlan, send);
          slides = result.slides;

          generationMeta = JSON.stringify({
            dna: { narrativeArchetype: result.meta.dna.narrativeArchetype, visualPersonality: result.meta.dna.visualPersonality, informationDensity: result.meta.dna.informationDensity, contentTone: result.meta.dna.contentTone },
            narrative: { archetype: result.meta.narrative.archetype, slideCount: result.meta.narrative.slideCount, throughLine: result.meta.narrative.throughLine },
            skills: { run: result.meta.skillsRun, skipped: result.meta.skillsSkipped, apiCalls: result.meta.apiCallsUsed, totalTimeMs: result.meta.totalTimeMs },
          });

          // Serialize skill outputs
          const outputs: Record<string, unknown> = {};
          result.skillOutputs.forEach((v, k) => { outputs[k] = { success: v.success, data: v.data, confidence: v.confidence, sources: v.sources, usedFallback: v.usedFallback }; });
          skillResults = JSON.stringify(outputs);

          if (result.critique && Object.keys(result.critique).length > 0) {
            critiqueResults = JSON.stringify(result.critique);
          }
        } else {
          // Basic generation (no skills)
          send({ phase: "Generation", skill: "basic", status: "started", message: "Generating deck...", progress: 10 });
          const { generateDeckFull } = await import("@/lib/generate-deck");
          const result = await generateDeckFull(body);
          slides = result.slides;
          generationMeta = JSON.stringify({
            dna: { narrativeArchetype: result.dna.narrativeArchetype, visualPersonality: result.dna.visualPersonality },
            narrative: { archetype: result.narrative.archetype, slideCount: result.narrative.slideCount },
          });
          send({ phase: "Generation", skill: "basic", status: "completed", message: `Generated ${slides.length} slides`, progress: 70 });
        }

        // Score the deck
        send({ phase: "Scoring", skill: "piq-score", status: "started", message: "Scoring deck...", progress: 90 });
        const piqScore = await scoreDeck(slides, {
          companyName: body.companyName, industry: body.industry || "", stage: body.stage || "",
          fundingTarget: body.fundingTarget || "", problem: body.problem, solution: body.solution,
          keyMetrics: body.keyMetrics || "", teamInfo: body.teamInfo || "",
        });

        // Create deck record
        const shareId = nanoid(10);
        const deck = await prisma.deck.create({
          data: {
            shareId, title: `${body.companyName} Pitch Deck`, companyName: body.companyName,
            industry: body.industry || "", stage: body.stage || "", fundingTarget: body.fundingTarget || "",
            investorType: body.investorType || "vc", problem: body.problem, solution: body.solution,
            keyMetrics: body.keyMetrics || "", teamInfo: body.teamInfo || "",
            slides: JSON.stringify(slides), themeId: body.themeId || "midnight",
            piqScore: JSON.stringify(piqScore), generationMeta, userId,
          },
        });

        // Update job
        await prisma.generationJob.update({
          where: { id: job.id },
          data: { status: "completed", deckId: deck.id, progress: 100, completedAt: new Date(), skillResults, critiqueResults },
        });

        // Send final event with deck data
        send({ phase: "Complete", skill: "", status: "completed", message: "Deck ready!", progress: 100 });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: "result",
          deck: { id: deck.id, shareId, title: deck.title, companyName: deck.companyName, slides, piqScore, themeId: deck.themeId, createdAt: deck.createdAt.toISOString() },
          jobId: job.id,
        })}\n\n`));

      } catch (err) {
        await prisma.generationJob.update({ where: { id: job.id }, data: { status: "failed", error: String(err) } });
        send({ phase: "Error", skill: "", status: "failed", message: String(err), progress: 0 });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
