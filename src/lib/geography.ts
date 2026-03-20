/**
 * Geography utilities for PitchIQ.
 * Maps ISO country codes to investment regions.
 */

const COUNTRY_REGION: Record<string, string> = {
  // North America
  US: "US",
  CA: "US",

  // Europe
  GB: "Europe",
  DE: "Europe",
  FR: "Europe",
  IT: "Europe",
  ES: "Europe",
  NL: "Europe",
  BE: "Europe",
  AT: "Europe",
  IE: "Europe",
  PT: "Europe",
  FI: "Europe",
  GR: "Europe",
  LU: "Europe",
  MT: "Europe",
  CY: "Europe",
  SK: "Europe",
  SI: "Europe",
  EE: "Europe",
  LV: "Europe",
  LT: "Europe",
  HR: "Europe",
  CH: "Europe",
  SE: "Europe",
  NO: "Europe",
  DK: "Europe",
  PL: "Europe",
  CZ: "Europe",
  HU: "Europe",
  RO: "Europe",
  BG: "Europe",
  RS: "Europe",
  UA: "Europe",
  RU: "Europe",
  TR: "Europe",

  // India
  IN: "India",

  // Southeast Asia
  SG: "Southeast Asia",
  ID: "Southeast Asia",
  TH: "Southeast Asia",
  VN: "Southeast Asia",
  PH: "Southeast Asia",
  MY: "Southeast Asia",

  // East Asia
  CN: "China",
  JP: "East Asia",
  KR: "East Asia",
  TW: "East Asia",
  HK: "East Asia",

  // Latin America
  BR: "Latin America",
  MX: "Latin America",
  CO: "Latin America",
  AR: "Latin America",
  CL: "Latin America",
  PE: "Latin America",

  // Africa
  NG: "Africa",
  KE: "Africa",
  ZA: "Africa",
  GH: "Africa",
  EG: "Africa",
  TZ: "Africa",
  RW: "Africa",
  UG: "Africa",
  ET: "Africa",

  // MENA
  AE: "MENA",
  SA: "MENA",
  QA: "MENA",
  KW: "MENA",
  IL: "Israel",

  // Oceania
  AU: "Australia",
  NZ: "Australia",

  // South Asia
  PK: "India",
  BD: "India",
};

/**
 * Map an ISO 3166-1 alpha-2 country code to an investment region.
 * Falls back to "Global" for unknown codes.
 */
export function countryToRegion(countryCode: string): string {
  if (!countryCode) return "US";
  return COUNTRY_REGION[countryCode.toUpperCase()] ?? "Global";
}

export const REGION_LIST = [
  "North America", "Europe", "UK", "India", "Southeast Asia",
  "East Asia", "China", "Japan/Korea", "MENA", "Sub-Saharan Africa",
  "Latin America", "Oceania", "Israel", "Central Asia", "Global",
] as const;

/**
 * Get all unique regions.
 */
export function allRegions(): string[] {
  return [...REGION_LIST];
}

/**
 * Compute geographic distance between two country codes.
 */
export function geoDistance(
  a: string,
  b: string,
): "same-country" | "same-region" | "cross-region" | "global" {
  if (!a || !b) return "global";
  const aUp = a.toUpperCase();
  const bUp = b.toUpperCase();
  if (aUp === bUp) return "same-country";
  const regionA = countryToRegion(aUp);
  const regionB = countryToRegion(bUp);
  if (regionA === regionB) return "same-region";
  // Adjacent regions get "cross-region"
  const adjacent: Record<string, string[]> = {
    "US": ["Latin America"],
    "Europe": ["MENA", "Israel", "UK"],
    "UK": ["Europe"],
    "India": ["Southeast Asia", "MENA"],
    "Southeast Asia": ["East Asia", "India", "China", "Australia"],
    "East Asia": ["Southeast Asia", "China"],
    "China": ["East Asia", "Southeast Asia"],
    "MENA": ["Europe", "India", "Africa"],
    "Africa": ["MENA", "Europe"],
    "Israel": ["Europe", "MENA"],
    "Latin America": ["US"],
    "Australia": ["Southeast Asia", "East Asia"],
  };
  if (adjacent[regionA]?.includes(regionB) || adjacent[regionB]?.includes(regionA)) {
    return "cross-region";
  }
  return "global";
}

/**
 * Compute geography proximity score for matching.
 */
export function geoProximityScore(
  startup: { country: string; city?: string },
  investor: { country?: string | null; city?: string | null; geographies: string[] },
): { score: number; maxScore: number; detail: string } {
  const maxScore = 20;

  // If investor invests "Global", always partial match
  if (investor.geographies.includes("Global")) {
    // Check if more specific match exists
    const startupRegion = countryToRegion(startup.country);
    if (investor.geographies.includes(startupRegion) || investor.geographies.includes(startup.country)) {
      if (investor.country && investor.country === startup.country) {
        if (investor.city && startup.city && investor.city.toLowerCase() === startup.city.toLowerCase()) {
          return { score: maxScore, maxScore, detail: `Same city: ${startup.city}` };
        }
        return { score: Math.round(maxScore * 0.9), maxScore, detail: `Same country: ${startup.country}` };
      }
      return { score: Math.round(maxScore * 0.8), maxScore, detail: `Invests in ${startupRegion}` };
    }
    return { score: Math.round(maxScore * 0.5), maxScore, detail: "Invests globally" };
  }

  // Check same city
  if (investor.country && investor.country === startup.country) {
    if (investor.city && startup.city && investor.city.toLowerCase() === startup.city.toLowerCase()) {
      return { score: maxScore, maxScore, detail: `Same city: ${startup.city}` };
    }
    return { score: Math.round(maxScore * 0.9), maxScore, detail: `Same country` };
  }

  // Check if startup's region is in investor's geographies
  const startupRegion = countryToRegion(startup.country);
  if (investor.geographies.includes(startupRegion) || investor.geographies.includes(startup.country)) {
    return { score: Math.round(maxScore * 0.75), maxScore, detail: `Invests in ${startupRegion}` };
  }

  // Check cross-region adjacency
  if (investor.country) {
    const dist = geoDistance(startup.country, investor.country);
    if (dist === "same-region") {
      return { score: Math.round(maxScore * 0.6), maxScore, detail: "Same region" };
    }
    if (dist === "cross-region") {
      return { score: Math.round(maxScore * 0.3), maxScore, detail: "Adjacent region" };
    }
  }

  return { score: 0, maxScore, detail: `Focuses on ${investor.geographies.slice(0, 3).join(", ")}` };
}

/**
 * Parse a free-text location string into structured data.
 */
export function parseLocation(text: string): { country: string; city?: string; region: string } {
  if (!text) return { country: "US", region: "US" };

  const lower = text.toLowerCase().trim();

  // Try "City, Country" format
  const parts = text.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    const city = parts[0];
    const countryText = parts[parts.length - 1];
    const country = textToCountryCode(countryText);
    return { country, city, region: countryToRegion(country) };
  }

  // Try matching against known country names/codes
  const country = textToCountryCode(lower);
  return { country, region: countryToRegion(country) };
}

function textToCountryCode(text: string): string {
  const lower = text.toLowerCase().trim();
  const map: Record<string, string> = {
    "us": "US", "usa": "US", "united states": "US", "america": "US",
    "uk": "GB", "united kingdom": "GB", "britain": "GB", "england": "GB",
    "india": "IN", "china": "CN", "japan": "JP", "korea": "KR", "south korea": "KR",
    "germany": "DE", "france": "FR", "spain": "ES", "italy": "IT",
    "brazil": "BR", "mexico": "MX", "colombia": "CO", "argentina": "AR", "chile": "CL",
    "nigeria": "NG", "kenya": "KE", "south africa": "ZA", "ghana": "GH", "egypt": "EG",
    "uae": "AE", "dubai": "AE", "saudi arabia": "SA", "israel": "IL",
    "singapore": "SG", "indonesia": "ID", "thailand": "TH", "vietnam": "VN", "philippines": "PH", "malaysia": "MY",
    "australia": "AU", "new zealand": "NZ", "canada": "CA",
    "netherlands": "NL", "switzerland": "CH", "sweden": "SE", "norway": "NO", "denmark": "DK",
    "poland": "PL", "portugal": "PT", "ireland": "IE", "austria": "AT", "belgium": "BE",
    "taiwan": "TW", "hong kong": "HK", "pakistan": "PK", "bangladesh": "BD",
    "peru": "PE", "turkey": "TR", "romania": "RO", "czech republic": "CZ", "hungary": "HU",
    "rwanda": "RW", "tanzania": "TZ", "uganda": "UG", "ethiopia": "ET",
    "qatar": "QA", "kuwait": "KW",
  };
  // Direct ISO code match
  if (lower.length === 2 && COUNTRY_REGION[lower.toUpperCase()]) return lower.toUpperCase();
  return map[lower] || "US";
}

/**
 * Country code to full name.
 */
export function countryName(code: string): string {
  const names: Record<string, string> = {
    US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France",
    IT: "Italy", ES: "Spain", NL: "Netherlands", BE: "Belgium", AT: "Austria",
    IE: "Ireland", PT: "Portugal", FI: "Finland", GR: "Greece", CH: "Switzerland",
    SE: "Sweden", NO: "Norway", DK: "Denmark", PL: "Poland", CZ: "Czech Republic",
    HU: "Hungary", RO: "Romania", BG: "Bulgaria", RS: "Serbia", UA: "Ukraine",
    RU: "Russia", TR: "Turkey", IN: "India", SG: "Singapore", ID: "Indonesia",
    TH: "Thailand", VN: "Vietnam", PH: "Philippines", MY: "Malaysia", CN: "China",
    JP: "Japan", KR: "South Korea", TW: "Taiwan", HK: "Hong Kong", BR: "Brazil",
    MX: "Mexico", CO: "Colombia", AR: "Argentina", CL: "Chile", PE: "Peru",
    NG: "Nigeria", KE: "Kenya", ZA: "South Africa", GH: "Ghana", EG: "Egypt",
    TZ: "Tanzania", RW: "Rwanda", UG: "Uganda", ET: "Ethiopia", AE: "UAE",
    SA: "Saudi Arabia", QA: "Qatar", KW: "Kuwait", IL: "Israel", AU: "Australia",
    NZ: "New Zealand", CA: "Canada", PK: "Pakistan", BD: "Bangladesh",
    LU: "Luxembourg", MT: "Malta", CY: "Cyprus", SK: "Slovakia", SI: "Slovenia",
    EE: "Estonia", LV: "Latvia", LT: "Lithuania", HR: "Croatia",
  };
  return names[code.toUpperCase()] || code;
}

/**
 * Generate flag emoji from ISO country code.
 */
export function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🏳️";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0))
  );
}
