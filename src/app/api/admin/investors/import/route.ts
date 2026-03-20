import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Bulk import investors from JSON or CSV.
 * Expects: { investors: InvestorProfile[] } or { csv: string, mapping: Record<string, string> }
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // JSON import
  if (body.investors && Array.isArray(body.investors)) {
    const results = { created: 0, updated: 0, errors: 0, details: [] as string[] };

    for (const inv of body.investors) {
      if (!inv.name) {
        results.errors++;
        results.details.push(`Skipped: missing name`);
        continue;
      }

      try {
        // Upsert by name
        await prisma.investorProfile.upsert({
          where: {
            id: inv.id || "nonexistent-id-to-force-create",
          },
          create: {
            name: inv.name,
            type: inv.type || "vc",
            website: inv.website || null,
            description: inv.description || null,
            stages: inv.stages || "[]",
            sectors: inv.sectors || "[]",
            geographies: inv.geographies || "[]",
            chequeMin: inv.chequeMin ? parseInt(inv.chequeMin) : null,
            chequeMax: inv.chequeMax ? parseInt(inv.chequeMax) : null,
            thesis: inv.thesis || null,
            country: inv.country || null,
            city: inv.city || null,
            currencies: inv.currencies || "[]",
            businessModels: inv.businessModels || "[]",
            revenueModels: inv.revenueModels || "[]",
            customerTypes: inv.customerTypes || "[]",
            dealStructures: inv.dealStructures || "[]",
            valuationMin: inv.valuationMin ? parseFloat(inv.valuationMin) : null,
            valuationMax: inv.valuationMax ? parseFloat(inv.valuationMax) : null,
            minRevenue: inv.minRevenue ? parseFloat(inv.minRevenue) : null,
            minGrowthRate: inv.minGrowthRate ? parseFloat(inv.minGrowthRate) : null,
            minTeamSize: inv.minTeamSize ? parseInt(inv.minTeamSize) : null,
            fundVintage: inv.fundVintage ? parseInt(inv.fundVintage) : null,
            fundSize: inv.fundSize ? parseFloat(inv.fundSize) : null,
            deploymentPace: inv.deploymentPace || null,
            averageCheckCount: inv.averageCheckCount ? parseInt(inv.averageCheckCount) : null,
            leadPreference: inv.leadPreference || null,
            boardSeatRequired: inv.boardSeatRequired === true,
            syndicateOpen: inv.syndicateOpen === true,
            followOnReserve: inv.followOnReserve !== false,
            impactFocus: inv.impactFocus === true,
            diversityLens: inv.diversityLens === true,
            thesisKeywords: inv.thesisKeywords || "[]",
            portfolioCompanies: inv.portfolioCompanies || "[]",
            portfolioConflictSectors: inv.portfolioConflictSectors || "[]",
            declinedSectors: inv.declinedSectors || "[]",
            coInvestors: inv.coInvestors || "[]",
            lpTypes: inv.lpTypes || "[]",
            notableDeals: inv.notableDeals || "[]",
            aum: inv.aum || null,
            partnerCount: inv.partnerCount ? parseInt(inv.partnerCount) : null,
            contactEmail: inv.contactEmail || null,
            linkedIn: inv.linkedIn || null,
            twitter: inv.twitter || null,
            source: "admin",
            verified: inv.verified === true,
            enabled: inv.enabled !== false,
          },
          update: {
            type: inv.type || undefined,
            website: inv.website || undefined,
            description: inv.description || undefined,
            stages: inv.stages || undefined,
            sectors: inv.sectors || undefined,
            geographies: inv.geographies || undefined,
            source: "admin",
          },
        });
        results.created++;
      } catch (e) {
        results.errors++;
        results.details.push(`Error importing ${inv.name}: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }

    return NextResponse.json(results);
  }

  // CSV import
  if (body.csv && typeof body.csv === "string") {
    const lines = body.csv.split("\n").filter((l: string) => l.trim());
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });
    }

    const mapping = body.mapping as Record<string, string> | undefined;
    const headers = lines[0].split(",").map((h: string) => h.trim().replace(/^"|"$/g, ""));

    // Map headers to DB fields
    const fieldMap: Record<number, string> = {};
    headers.forEach((h: string, i: number) => {
      const mapped = mapping?.[h] || h;
      fieldMap[i] = mapped;
    });

    const results = { created: 0, errors: 0, details: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      values.forEach((v: string, j: number) => {
        if (fieldMap[j]) row[fieldMap[j]] = v;
      });

      if (!row.name) {
        results.errors++;
        results.details.push(`Row ${i + 1}: missing name`);
        continue;
      }

      try {
        await prisma.investorProfile.create({
          data: {
            name: row.name,
            type: row.type || "vc",
            website: row.website || null,
            description: row.description || null,
            stages: row.stages || "[]",
            sectors: row.sectors || "[]",
            geographies: row.geographies || "[]",
            chequeMin: row.chequeMin ? parseInt(row.chequeMin) : null,
            chequeMax: row.chequeMax ? parseInt(row.chequeMax) : null,
            thesis: row.thesis || null,
            country: row.country || null,
            city: row.city || null,
            source: "admin",
            verified: false,
            enabled: true,
          },
        });
        results.created++;
      } catch (e) {
        results.errors++;
        results.details.push(`Row ${i + 1} (${row.name}): ${e instanceof Error ? e.message : "unknown"}`);
      }
    }

    return NextResponse.json(results);
  }

  return NextResponse.json({ error: "Provide either { investors: [...] } or { csv: '...', mapping: {...} }" }, { status: 400 });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
