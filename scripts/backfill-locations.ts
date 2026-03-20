/**
 * Backfill script: sets country="US" and currency="USD" for existing decks
 * that have geography="US" (from old matching) but no country field.
 *
 * Also backfills InvestorProfile country from geographies field.
 *
 * Run with: npx tsx scripts/backfill-locations.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Backfill Deck.country from existing geography data
  const decksUpdated = await prisma.deck.updateMany({
    where: { country: null },
    data: { country: "US", currency: "USD" },
  });
  console.log(`Backfilled ${decksUpdated.count} decks with country=US, currency=USD`);

  // 2. Backfill InvestorProfile.country from geographies
  const investors = await prisma.investorProfile.findMany({
    where: { country: null },
    select: { id: true, geographies: true, name: true },
  });

  const geoToCountry: Record<string, string> = {
    US: "US",
    Europe: "GB",
    UK: "GB",
    India: "IN",
    China: "CN",
    Israel: "IL",
    Global: "US",
    "Southeast Asia": "SG",
    "Latin America": "BR",
    Africa: "ZA",
    MENA: "AE",
    Asia: "SG",
  };

  let investorsUpdated = 0;
  for (const inv of investors) {
    try {
      const geos: string[] = JSON.parse(inv.geographies);
      const firstGeo = geos[0];
      const country = firstGeo ? (geoToCountry[firstGeo] || "US") : "US";

      await prisma.investorProfile.update({
        where: { id: inv.id },
        data: { country, currencies: JSON.stringify(["USD"]) },
      });
      investorsUpdated++;
    } catch {
      // skip
    }
  }
  console.log(`Backfilled ${investorsUpdated} investor profiles with country codes`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
