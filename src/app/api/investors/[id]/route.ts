import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/investors/[id] — update an investor contact
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const contact = await prisma.investorContact.findUnique({
      where: { id: params.id },
    });

    if (!contact || contact.userId !== userId) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name, firm, email, status, notes, tags, nextFollowUp,
      warmIntro, introSource, sentimentScore, lastInteractionAt,
      dealProbability, expectedCloseDate, termSheetReceived, commitAmount,
    } = body;

    const validStatuses = ["identified", "contacted", "meeting", "due_diligence", "term_sheet", "committed", "passed"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};
    if (name !== undefined) data.name = name.trim();
    if (firm !== undefined) data.firm = firm?.trim() || null;
    if (email !== undefined) data.email = email?.trim() || null;
    if (status !== undefined && validStatuses.includes(status)) data.status = status;
    if (notes !== undefined) data.notes = notes.trim();

    if (tags !== undefined) {
      // Validate tags parses as a string array
      try {
        const parsed = JSON.parse(tags);
        if (!Array.isArray(parsed) || !parsed.every((t: unknown) => typeof t === "string")) {
          return NextResponse.json({ error: "tags must be a JSON string array" }, { status: 400 });
        }
        data.tags = tags;
      } catch {
        return NextResponse.json({ error: "tags must be valid JSON" }, { status: 400 });
      }
    }

    if (nextFollowUp !== undefined) {
      if (nextFollowUp === null) {
        data.nextFollowUp = null;
      } else {
        const d = new Date(nextFollowUp);
        if (isNaN(d.getTime())) {
          return NextResponse.json({ error: "nextFollowUp must be a valid ISO date string" }, { status: 400 });
        }
        data.nextFollowUp = d;
      }
    }

    // Enhanced CRM fields
    if (warmIntro !== undefined) {
      data.warmIntro = Boolean(warmIntro);
    }
    if (introSource !== undefined) {
      data.introSource = introSource?.trim() || null;
    }
    if (sentimentScore !== undefined) {
      const score = Number(sentimentScore);
      if (!isNaN(score) && score >= -2 && score <= 2) {
        data.sentimentScore = Math.round(score);
      }
    }
    if (lastInteractionAt !== undefined) {
      if (lastInteractionAt === null) {
        data.lastInteractionAt = null;
      } else {
        const d = new Date(lastInteractionAt);
        if (!isNaN(d.getTime())) {
          data.lastInteractionAt = d;
        }
      }
    }
    if (dealProbability !== undefined) {
      const prob = Number(dealProbability);
      if (!isNaN(prob) && prob >= 0 && prob <= 100) {
        data.dealProbability = Math.round(prob);
      }
    }
    if (expectedCloseDate !== undefined) {
      if (expectedCloseDate === null) {
        data.expectedCloseDate = null;
      } else {
        const d = new Date(expectedCloseDate);
        if (!isNaN(d.getTime())) {
          data.expectedCloseDate = d;
        }
      }
    }
    if (termSheetReceived !== undefined) {
      data.termSheetReceived = Boolean(termSheetReceived);
    }
    if (commitAmount !== undefined) {
      if (commitAmount === null) {
        data.commitAmount = null;
      } else {
        const amount = Number(commitAmount);
        if (!isNaN(amount) && amount >= 0) {
          data.commitAmount = amount;
        }
      }
    }

    const updated = await prisma.investorContact.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ contact: updated });
  } catch (error) {
    console.error("[investors] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

/**
 * DELETE /api/investors/[id] — delete an investor contact
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const contact = await prisma.investorContact.findUnique({
      where: { id: params.id },
    });

    if (!contact || contact.userId !== userId) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    await prisma.investorContact.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[investors] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
