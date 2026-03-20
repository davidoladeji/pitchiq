"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Tag,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  X,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { getPlanLimits } from "@/lib/plan-limits";

interface ProfileSummary {
  id: string;
  companyName: string;
  industry: string;
  stage: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Country data                                                       */
/* ------------------------------------------------------------------ */
const COUNTRIES: { code: string; name: string; currency: string }[] = [
  { code: "AF", name: "Afghanistan", currency: "AFN" },
  { code: "AL", name: "Albania", currency: "ALL" },
  { code: "DZ", name: "Algeria", currency: "DZD" },
  { code: "AD", name: "Andorra", currency: "EUR" },
  { code: "AO", name: "Angola", currency: "AOA" },
  { code: "AG", name: "Antigua and Barbuda", currency: "XCD" },
  { code: "AR", name: "Argentina", currency: "ARS" },
  { code: "AM", name: "Armenia", currency: "AMD" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "AT", name: "Austria", currency: "EUR" },
  { code: "AZ", name: "Azerbaijan", currency: "AZN" },
  { code: "BS", name: "Bahamas", currency: "BSD" },
  { code: "BH", name: "Bahrain", currency: "BHD" },
  { code: "BD", name: "Bangladesh", currency: "BDT" },
  { code: "BB", name: "Barbados", currency: "BBD" },
  { code: "BY", name: "Belarus", currency: "BYN" },
  { code: "BE", name: "Belgium", currency: "EUR" },
  { code: "BZ", name: "Belize", currency: "BZD" },
  { code: "BJ", name: "Benin", currency: "XOF" },
  { code: "BT", name: "Bhutan", currency: "BTN" },
  { code: "BO", name: "Bolivia", currency: "BOB" },
  { code: "BA", name: "Bosnia and Herzegovina", currency: "BAM" },
  { code: "BW", name: "Botswana", currency: "BWP" },
  { code: "BR", name: "Brazil", currency: "BRL" },
  { code: "BN", name: "Brunei", currency: "BND" },
  { code: "BG", name: "Bulgaria", currency: "BGN" },
  { code: "BF", name: "Burkina Faso", currency: "XOF" },
  { code: "BI", name: "Burundi", currency: "BIF" },
  { code: "CV", name: "Cabo Verde", currency: "CVE" },
  { code: "KH", name: "Cambodia", currency: "KHR" },
  { code: "CM", name: "Cameroon", currency: "XAF" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "CF", name: "Central African Republic", currency: "XAF" },
  { code: "TD", name: "Chad", currency: "XAF" },
  { code: "CL", name: "Chile", currency: "CLP" },
  { code: "CN", name: "China", currency: "CNY" },
  { code: "CO", name: "Colombia", currency: "COP" },
  { code: "KM", name: "Comoros", currency: "KMF" },
  { code: "CG", name: "Congo", currency: "XAF" },
  { code: "CD", name: "Congo (DRC)", currency: "CDF" },
  { code: "CR", name: "Costa Rica", currency: "CRC" },
  { code: "CI", name: "Cote d'Ivoire", currency: "XOF" },
  { code: "HR", name: "Croatia", currency: "EUR" },
  { code: "CU", name: "Cuba", currency: "CUP" },
  { code: "CY", name: "Cyprus", currency: "EUR" },
  { code: "CZ", name: "Czech Republic", currency: "CZK" },
  { code: "DK", name: "Denmark", currency: "DKK" },
  { code: "DJ", name: "Djibouti", currency: "DJF" },
  { code: "DM", name: "Dominica", currency: "XCD" },
  { code: "DO", name: "Dominican Republic", currency: "DOP" },
  { code: "EC", name: "Ecuador", currency: "USD" },
  { code: "EG", name: "Egypt", currency: "EGP" },
  { code: "SV", name: "El Salvador", currency: "USD" },
  { code: "GQ", name: "Equatorial Guinea", currency: "XAF" },
  { code: "ER", name: "Eritrea", currency: "ERN" },
  { code: "EE", name: "Estonia", currency: "EUR" },
  { code: "SZ", name: "Eswatini", currency: "SZL" },
  { code: "ET", name: "Ethiopia", currency: "ETB" },
  { code: "FJ", name: "Fiji", currency: "FJD" },
  { code: "FI", name: "Finland", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "GA", name: "Gabon", currency: "XAF" },
  { code: "GM", name: "Gambia", currency: "GMD" },
  { code: "GE", name: "Georgia", currency: "GEL" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "GR", name: "Greece", currency: "EUR" },
  { code: "GD", name: "Grenada", currency: "XCD" },
  { code: "GT", name: "Guatemala", currency: "GTQ" },
  { code: "GN", name: "Guinea", currency: "GNF" },
  { code: "GW", name: "Guinea-Bissau", currency: "XOF" },
  { code: "GY", name: "Guyana", currency: "GYD" },
  { code: "HT", name: "Haiti", currency: "HTG" },
  { code: "HN", name: "Honduras", currency: "HNL" },
  { code: "HU", name: "Hungary", currency: "HUF" },
  { code: "IS", name: "Iceland", currency: "ISK" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "ID", name: "Indonesia", currency: "IDR" },
  { code: "IR", name: "Iran", currency: "IRR" },
  { code: "IQ", name: "Iraq", currency: "IQD" },
  { code: "IE", name: "Ireland", currency: "EUR" },
  { code: "IL", name: "Israel", currency: "ILS" },
  { code: "IT", name: "Italy", currency: "EUR" },
  { code: "JM", name: "Jamaica", currency: "JMD" },
  { code: "JP", name: "Japan", currency: "JPY" },
  { code: "JO", name: "Jordan", currency: "JOD" },
  { code: "KZ", name: "Kazakhstan", currency: "KZT" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "KI", name: "Kiribati", currency: "AUD" },
  { code: "KP", name: "North Korea", currency: "KPW" },
  { code: "KR", name: "South Korea", currency: "KRW" },
  { code: "KW", name: "Kuwait", currency: "KWD" },
  { code: "KG", name: "Kyrgyzstan", currency: "KGS" },
  { code: "LA", name: "Laos", currency: "LAK" },
  { code: "LV", name: "Latvia", currency: "EUR" },
  { code: "LB", name: "Lebanon", currency: "LBP" },
  { code: "LS", name: "Lesotho", currency: "LSL" },
  { code: "LR", name: "Liberia", currency: "LRD" },
  { code: "LY", name: "Libya", currency: "LYD" },
  { code: "LI", name: "Liechtenstein", currency: "CHF" },
  { code: "LT", name: "Lithuania", currency: "EUR" },
  { code: "LU", name: "Luxembourg", currency: "EUR" },
  { code: "MG", name: "Madagascar", currency: "MGA" },
  { code: "MW", name: "Malawi", currency: "MWK" },
  { code: "MY", name: "Malaysia", currency: "MYR" },
  { code: "MV", name: "Maldives", currency: "MVR" },
  { code: "ML", name: "Mali", currency: "XOF" },
  { code: "MT", name: "Malta", currency: "EUR" },
  { code: "MH", name: "Marshall Islands", currency: "USD" },
  { code: "MR", name: "Mauritania", currency: "MRU" },
  { code: "MU", name: "Mauritius", currency: "MUR" },
  { code: "MX", name: "Mexico", currency: "MXN" },
  { code: "FM", name: "Micronesia", currency: "USD" },
  { code: "MD", name: "Moldova", currency: "MDL" },
  { code: "MC", name: "Monaco", currency: "EUR" },
  { code: "MN", name: "Mongolia", currency: "MNT" },
  { code: "ME", name: "Montenegro", currency: "EUR" },
  { code: "MA", name: "Morocco", currency: "MAD" },
  { code: "MZ", name: "Mozambique", currency: "MZN" },
  { code: "MM", name: "Myanmar", currency: "MMK" },
  { code: "NA", name: "Namibia", currency: "NAD" },
  { code: "NR", name: "Nauru", currency: "AUD" },
  { code: "NP", name: "Nepal", currency: "NPR" },
  { code: "NL", name: "Netherlands", currency: "EUR" },
  { code: "NZ", name: "New Zealand", currency: "NZD" },
  { code: "NI", name: "Nicaragua", currency: "NIO" },
  { code: "NE", name: "Niger", currency: "XOF" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "MK", name: "North Macedonia", currency: "MKD" },
  { code: "NO", name: "Norway", currency: "NOK" },
  { code: "OM", name: "Oman", currency: "OMR" },
  { code: "PK", name: "Pakistan", currency: "PKR" },
  { code: "PW", name: "Palau", currency: "USD" },
  { code: "PS", name: "Palestine", currency: "ILS" },
  { code: "PA", name: "Panama", currency: "PAB" },
  { code: "PG", name: "Papua New Guinea", currency: "PGK" },
  { code: "PY", name: "Paraguay", currency: "PYG" },
  { code: "PE", name: "Peru", currency: "PEN" },
  { code: "PH", name: "Philippines", currency: "PHP" },
  { code: "PL", name: "Poland", currency: "PLN" },
  { code: "PT", name: "Portugal", currency: "EUR" },
  { code: "QA", name: "Qatar", currency: "QAR" },
  { code: "RO", name: "Romania", currency: "RON" },
  { code: "RU", name: "Russia", currency: "RUB" },
  { code: "RW", name: "Rwanda", currency: "RWF" },
  { code: "KN", name: "Saint Kitts and Nevis", currency: "XCD" },
  { code: "LC", name: "Saint Lucia", currency: "XCD" },
  { code: "VC", name: "Saint Vincent and the Grenadines", currency: "XCD" },
  { code: "WS", name: "Samoa", currency: "WST" },
  { code: "SM", name: "San Marino", currency: "EUR" },
  { code: "ST", name: "Sao Tome and Principe", currency: "STN" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR" },
  { code: "SN", name: "Senegal", currency: "XOF" },
  { code: "RS", name: "Serbia", currency: "RSD" },
  { code: "SC", name: "Seychelles", currency: "SCR" },
  { code: "SL", name: "Sierra Leone", currency: "SLE" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "SK", name: "Slovakia", currency: "EUR" },
  { code: "SI", name: "Slovenia", currency: "EUR" },
  { code: "SB", name: "Solomon Islands", currency: "SBD" },
  { code: "SO", name: "Somalia", currency: "SOS" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "SS", name: "South Sudan", currency: "SSP" },
  { code: "ES", name: "Spain", currency: "EUR" },
  { code: "LK", name: "Sri Lanka", currency: "LKR" },
  { code: "SD", name: "Sudan", currency: "SDG" },
  { code: "SR", name: "Suriname", currency: "SRD" },
  { code: "SE", name: "Sweden", currency: "SEK" },
  { code: "CH", name: "Switzerland", currency: "CHF" },
  { code: "SY", name: "Syria", currency: "SYP" },
  { code: "TW", name: "Taiwan", currency: "TWD" },
  { code: "TJ", name: "Tajikistan", currency: "TJS" },
  { code: "TZ", name: "Tanzania", currency: "TZS" },
  { code: "TH", name: "Thailand", currency: "THB" },
  { code: "TL", name: "Timor-Leste", currency: "USD" },
  { code: "TG", name: "Togo", currency: "XOF" },
  { code: "TO", name: "Tonga", currency: "TOP" },
  { code: "TT", name: "Trinidad and Tobago", currency: "TTD" },
  { code: "TN", name: "Tunisia", currency: "TND" },
  { code: "TR", name: "Turkey", currency: "TRY" },
  { code: "TM", name: "Turkmenistan", currency: "TMT" },
  { code: "TV", name: "Tuvalu", currency: "AUD" },
  { code: "UG", name: "Uganda", currency: "UGX" },
  { code: "UA", name: "Ukraine", currency: "UAH" },
  { code: "AE", name: "United Arab Emirates", currency: "AED" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "UY", name: "Uruguay", currency: "UYU" },
  { code: "UZ", name: "Uzbekistan", currency: "UZS" },
  { code: "VU", name: "Vanuatu", currency: "VUV" },
  { code: "VA", name: "Vatican City", currency: "EUR" },
  { code: "VE", name: "Venezuela", currency: "VES" },
  { code: "VN", name: "Vietnam", currency: "VND" },
  { code: "YE", name: "Yemen", currency: "YER" },
  { code: "ZM", name: "Zambia", currency: "ZMW" },
  { code: "ZW", name: "Zimbabwe", currency: "ZWL" },
];

function countryFlag(code: string): string {
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 127397 + c.charCodeAt(0)),
  );
}

/* Currency symbols for display */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "\u20ac", GBP: "\u00a3", JPY: "\u00a5", CNY: "\u00a5",
  INR: "\u20b9", NGN: "\u20a6", BRL: "R$", CAD: "C$", AUD: "A$",
  KRW: "\u20a9", ZAR: "R", CHF: "CHF", SEK: "kr", NOK: "kr",
  DKK: "kr", PLN: "z\u0142", CZK: "K\u010d", HUF: "Ft", MXN: "$",
  SGD: "S$", HKD: "HK$", NZD: "NZ$", TRY: "\u20ba", SAR: "\ufdfc",
  AED: "AED", ILS: "\u20aa", THB: "\u0e3f", MYR: "RM", PHP: "\u20b1",
  IDR: "Rp", KES: "KSh", GHS: "GH\u20b5", EGP: "E\u00a3", PKR: "Rs",
  BDT: "\u09f3", VND: "\u20ab", TWD: "NT$", COP: "$", ARS: "$",
  CLP: "$", PEN: "S/", UAH: "\u20b4",
};

function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] || code;
}

/* All unique currencies from countries */
const ALL_CURRENCIES = Array.from(new Set(COUNTRIES.map((c) => c.currency))).sort();

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const SECTOR_OPTIONS = [
  "saas", "fintech", "ai", "healthtech", "edtech", "marketplace", "consumer",
  "enterprise", "crypto", "climate", "biotech", "security", "proptech",
  "logistics", "insurtech", "food-tech", "robotics", "gaming", "aerospace",
  "defense", "hardware", "infrastructure", "media", "deeptech",
];

const BUSINESS_MODELS = ["SaaS", "Marketplace", "Hardware", "Services", "Consumer", "DeepTech", "BioTech", "Media", "Other"];
const REVENUE_MODELS = ["Subscription", "Transactional", "Advertising", "Licensing", "Freemium", "Usage-Based", "Hybrid"];
const CUSTOMER_TYPES = ["B2B", "B2C", "B2B2C", "B2G", "D2C"];
const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth"];
const DEAL_STRUCTURES = ["Equity", "SAFE", "Convertible Note", "Revenue-Based"];
const INVESTOR_TYPES = ["VC", "Angel", "Accelerator", "Family Office", "Corporate VC"];
const DIVERSITY_OPTIONS = ["Gender Diverse", "Ethnicity Diverse", "Immigrant Founded"];
const TARGET_MARKET_OPTIONS = [
  "US", "Canada", "Europe", "UK", "LATAM", "Africa", "Middle East",
  "South Asia", "Southeast Asia", "East Asia", "Oceania", "Global",
];

const INDUSTRY_SUGGESTIONS = [
  "Technology", "Financial Services", "Healthcare", "Education", "E-commerce",
  "Real Estate", "Energy", "Transportation", "Agriculture", "Media & Entertainment",
  "Cybersecurity", "Telecommunications", "Manufacturing", "Legal", "HR & Recruiting",
  "Marketing & Advertising", "Travel & Hospitality", "Food & Beverage", "Sports",
  "Government & Public Sector", "Sustainability", "Aerospace", "Automotive",
];

const STEP_LABELS = ["Company", "Classification", "Traction", "Fundraising", "Team", "Preferences"];
const STEP_ICONS = [Building2, Tag, TrendingUp, DollarSign, Users, Search];

/* ------------------------------------------------------------------ */
/*  Form state type                                                    */
/* ------------------------------------------------------------------ */
interface ProfileForm {
  companyName: string;
  tagline: string;
  country: string;
  city: string;
  currency: string;
  foundedYear: string;
  industry: string;
  sectors: string[];
  businessModel: string;
  revenueModel: string;
  customerType: string;
  targetMarkets: string[];
  monthlyRevenue: string;
  annualRevenue: string;
  revenueGrowthRate: string;
  userCount: string;
  teamSize: string;
  stage: string;
  fundingTarget: string;
  dealStructure: string;
  preMoneyValuation: string;
  previousRaised: string;
  hasLeadInvestor: boolean;
  leadNeeded: boolean;
  boardSeatOk: boolean;
  founderCount: string;
  hasRepeatFounder: boolean;
  hasTechnicalFounder: boolean;
  founderDiversity: string[];
  investorTypePrefs: string[];
}

const EMPTY_FORM: ProfileForm = {
  companyName: "",
  tagline: "",
  country: "",
  city: "",
  currency: "USD",
  foundedYear: "",
  industry: "",
  sectors: [],
  businessModel: "",
  revenueModel: "",
  customerType: "",
  targetMarkets: [],
  monthlyRevenue: "",
  annualRevenue: "",
  revenueGrowthRate: "",
  userCount: "",
  teamSize: "",
  stage: "",
  fundingTarget: "",
  dealStructure: "",
  preMoneyValuation: "",
  previousRaised: "",
  hasLeadInvestor: false,
  leadNeeded: true,
  boardSeatOk: true,
  founderCount: "",
  hasRepeatFounder: false,
  hasTechnicalFounder: false,
  founderDiversity: [],
  investorTypePrefs: [],
};

const TOTAL_FIELDS = Object.keys(EMPTY_FORM).length;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function parseJsonArray(val: string | string[] | null | undefined): string[] {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

function completeness(form: ProfileForm): number {
  let filled = 0;
  for (const [, v] of Object.entries(form)) {
    if (typeof v === "string" && v.trim()) filled++;
    else if (typeof v === "boolean") filled++; // booleans are always "filled"
    else if (Array.isArray(v) && v.length > 0) filled++;
  }
  return Math.round((filled / TOTAL_FIELDS) * 100);
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default function StartupProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Multi-profile state
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [plan, setPlan] = useState("starter");
  const [deleting, setDeleting] = useState<string | null>(null);

  const limits = getPlanLimits(plan);
  const canAddMore = limits.maxStartupProfiles === Infinity || profiles.length < limits.maxStartupProfiles;

  // Country search state
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);

  // Industry suggestion state
  const [industrySuggOpen, setIndustrySuggOpen] = useState(false);

  /* ---- Populate form from profile data ---- */
  const populateForm = useCallback((p: Record<string, unknown>) => {
    setForm({
      companyName: (p.companyName as string) || "",
      tagline: (p.tagline as string) || "",
      country: (p.country as string) || "",
      city: (p.city as string) || "",
      currency: (p.currency as string) || "USD",
      foundedYear: p.foundedYear?.toString() || "",
      industry: (p.industry as string) || "",
      sectors: parseJsonArray(p.sectors as string | string[] | null),
      businessModel: (p.businessModel as string) || "",
      revenueModel: (p.revenueModel as string) || "",
      customerType: (p.customerType as string) || "",
      targetMarkets: parseJsonArray(p.targetMarkets as string | string[] | null),
      monthlyRevenue: p.monthlyRevenue?.toString() || "",
      annualRevenue: p.annualRevenue?.toString() || "",
      revenueGrowthRate: p.revenueGrowthRate?.toString() || "",
      userCount: p.userCount?.toString() || "",
      teamSize: p.teamSize?.toString() || "",
      stage: (p.stage as string) || "",
      fundingTarget: p.fundingTarget?.toString() || "",
      dealStructure: (p.dealStructure as string) || "",
      preMoneyValuation: p.preMoneyValuation?.toString() || "",
      previousRaised: p.previousRaised?.toString() || "",
      hasLeadInvestor: (p.hasLeadInvestor as boolean) ?? false,
      leadNeeded: (p.leadNeeded as boolean) ?? true,
      boardSeatOk: (p.boardSeatOk as boolean) ?? true,
      founderCount: p.founderCount?.toString() || "",
      hasRepeatFounder: (p.hasRepeatFounder as boolean) ?? false,
      hasTechnicalFounder: (p.hasTechnicalFounder as boolean) ?? false,
      founderDiversity: parseJsonArray(p.founderDiversity as string | string[] | null),
      investorTypePrefs: parseJsonArray(p.investorTypePrefs as string | string[] | null),
    });
    const c = COUNTRIES.find((c) => c.code === (p.country as string));
    if (c) setCountrySearch(c.name);
    else setCountrySearch("");
  }, []);

  /* ---- Load existing profiles ---- */
  const loadProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/startup-profile");
      if (!res.ok) return;
      const data = await res.json();
      if (data.profiles) {
        setProfiles(
          data.profiles.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            companyName: (p.companyName as string) || "Untitled",
            industry: (p.industry as string) || "",
            stage: (p.stage as string) || "",
            updatedAt: (p.updatedAt as string) || "",
          })),
        );
        return data.profiles;
      }
    } catch {
      // ignore
    }
    return [];
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/startup-profile");
        const data = await res.json();
        if (data.plan) setPlan(data.plan);
        if (data.profiles && data.profiles.length > 0) {
          setProfiles(
            data.profiles.map((p: Record<string, unknown>) => ({
              id: p.id as string,
              companyName: (p.companyName as string) || "Untitled",
              industry: (p.industry as string) || "",
              stage: (p.stage as string) || "",
              updatedAt: (p.updatedAt as string) || "",
            })),
          );
          // Auto-select and populate the first (most recent) profile
          const first = data.profiles[0];
          setEditingProfileId(first.id as string);
          populateForm(first);
        }
      } catch {
        // ignore fetch errors on load
      } finally {
        setLoading(false);
      }
    })();
  }, [populateForm]);

  /* ---- Save to API ---- */
  const saveProfile = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: Record<string, unknown> = {
        ...form,
        sectors: JSON.stringify(form.sectors),
        targetMarkets: JSON.stringify(form.targetMarkets),
        founderDiversity: JSON.stringify(form.founderDiversity),
        investorTypePrefs: JSON.stringify(form.investorTypePrefs),
        monthlyRevenue: form.monthlyRevenue ? Number(form.monthlyRevenue) : null,
        annualRevenue: form.annualRevenue ? Number(form.annualRevenue) : null,
        revenueGrowthRate: form.revenueGrowthRate ? Number(form.revenueGrowthRate) : null,
        userCount: form.userCount ? Number(form.userCount) : null,
        teamSize: form.teamSize ? Number(form.teamSize) : null,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : null,
        fundingTarget: form.fundingTarget ? Number(form.fundingTarget) : null,
        preMoneyValuation: form.preMoneyValuation ? Number(form.preMoneyValuation) : null,
        previousRaised: form.previousRaised ? Number(form.previousRaised) : null,
        founderCount: form.founderCount ? Number(form.founderCount) : null,
      };
      // Include id if editing an existing profile
      if (editingProfileId) {
        body.id = editingProfileId;
      }
      const res = await fetch("/api/startup-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return false;
      }
      // If we just created a new profile, set its id for subsequent saves
      if (!editingProfileId && data.profile?.id) {
        setEditingProfileId(data.profile.id);
      }
      // Refresh profiles list
      await loadProfiles();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return true;
    } catch {
      setError("Network error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, editingProfileId, loadProfiles]);

  /* ---- Delete profile ---- */
  const deleteProfile = useCallback(async (profileId: string) => {
    setDeleting(profileId);
    setError(null);
    try {
      const res = await fetch(`/api/startup-profile?id=${profileId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to delete");
        return;
      }
      // Refresh list
      const freshProfiles = await loadProfiles();
      // If we deleted the currently edited profile, select another or clear form
      if (editingProfileId === profileId) {
        if (freshProfiles && freshProfiles.length > 0) {
          setEditingProfileId(freshProfiles[0].id as string);
          populateForm(freshProfiles[0]);
        } else {
          setEditingProfileId(null);
          setForm(EMPTY_FORM);
          setCountrySearch("");
        }
        setStep(0);
      }
    } catch {
      setError("Network error");
    } finally {
      setDeleting(null);
    }
  }, [editingProfileId, loadProfiles, populateForm]);

  /* ---- Start new profile ---- */
  const startNewProfile = useCallback(() => {
    setEditingProfileId(null);
    setForm(EMPTY_FORM);
    setCountrySearch("");
    setStep(0);
    setError(null);
    setSaved(false);
  }, []);

  /* ---- Select existing profile to edit ---- */
  const selectProfile = useCallback(async (profileId: string) => {
    setError(null);
    setSaved(false);
    setStep(0);
    try {
      const res = await fetch("/api/startup-profile");
      if (!res.ok) return;
      const data = await res.json();
      const p = data.profiles?.find((prof: { id: string }) => prof.id === profileId);
      if (p) {
        setEditingProfileId(p.id);
        populateForm(p);
      }
    } catch {
      // ignore
    }
  }, [populateForm]);

  /* ---- Field updater ---- */
  const set = useCallback(<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayItem = useCallback((key: keyof ProfileForm, item: string) => {
    setForm((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item],
      };
    });
  }, []);

  /* ---- Navigation ---- */
  const goNext = useCallback(async () => {
    // Save progress on step transition
    await saveProfile();
    if (step < 5) setStep(step + 1);
  }, [step, saveProfile]);

  const goPrev = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  const handleFinish = useCallback(async () => {
    const ok = await saveProfile();
    if (ok) router.push("/dashboard");
  }, [saveProfile, router]);

  /* ---- Filtered countries ---- */
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [countrySearch]);

  /* ---- Industry suggestions filtered ---- */
  const filteredIndustries = useMemo(() => {
    if (!form.industry.trim()) return INDUSTRY_SUGGESTIONS;
    const q = form.industry.toLowerCase();
    return INDUSTRY_SUGGESTIONS.filter((i) => i.toLowerCase().includes(q));
  }, [form.industry]);

  const pct = completeness(form);

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F0F14" }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#4361EE]" />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Shared input styles                                              */
  /* ---------------------------------------------------------------- */
  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#4361EE] focus:ring-1 focus:ring-[#4361EE] transition";
  const selectCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#4361EE] focus:ring-1 focus:ring-[#4361EE] transition appearance-none";
  const labelCls = "block text-xs font-medium text-white/60 mb-1";

  /* ---------------------------------------------------------------- */
  /*  Reusable sub-components                                          */
  /* ---------------------------------------------------------------- */
  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-white/80">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${value ? "bg-[#4361EE]" : "bg-white/10"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${value ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );

  const MultiSelectTags = ({ options, selected, onToggle, columns }: { options: string[]; selected: string[]; onToggle: (s: string) => void; columns?: number }) => (
    <div className={`flex flex-wrap gap-2 ${columns ? "" : ""}`}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`rounded-md border px-3 py-1 text-xs font-medium transition ${
              active
                ? "border-[#4361EE] bg-[#4361EE]/20 text-[#4361EE]"
                : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  const CurrencyInput = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
          {currencySymbol(form.currency)}
        </span>
        <input
          type="number"
          className={inputCls + " pl-10"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "0"}
        />
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Step renderers                                                   */
  /* ---------------------------------------------------------------- */
  const renderStep0 = () => (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Company Name *</label>
        <input
          className={inputCls}
          value={form.companyName}
          onChange={(e) => set("companyName", e.target.value)}
          placeholder="Acme Corp"
        />
      </div>
      <div>
        <label className={labelCls}>Tagline</label>
        <input
          className={inputCls}
          value={form.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          placeholder="One-line description of your company"
        />
      </div>
      <div className="relative">
        <label className={labelCls}>Country *</label>
        <input
          className={inputCls}
          value={countrySearch}
          onChange={(e) => {
            setCountrySearch(e.target.value);
            setCountryOpen(true);
          }}
          onFocus={() => setCountryOpen(true)}
          placeholder="Search countries..."
        />
        {form.country && (
          <span className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 text-lg">
            {countryFlag(form.country)}
          </span>
        )}
        {countryOpen && (
          <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#1A1A24] shadow-xl">
            {filteredCountries.slice(0, 50).map((c) => (
              <button
                key={c.code}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5"
                onClick={() => {
                  set("country", c.code);
                  set("currency", c.currency);
                  setCountrySearch(c.name);
                  setCountryOpen(false);
                }}
              >
                <span>{countryFlag(c.code)}</span>
                <span>{c.name}</span>
                <span className="ml-auto text-xs text-white/30">{c.code}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="px-3 py-2 text-sm text-white/30">No results</div>
            )}
          </div>
        )}
      </div>
      <div>
        <label className={labelCls}>City</label>
        <input
          className={inputCls}
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="San Francisco"
        />
      </div>
      <div>
        <label className={labelCls}>Currency</label>
        <select
          className={selectCls}
          value={form.currency}
          onChange={(e) => set("currency", e.target.value)}
        >
          {ALL_CURRENCIES.map((c) => (
            <option key={c} value={c}>{c} ({currencySymbol(c)})</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>Founded Year</label>
        <input
          type="number"
          className={inputCls}
          value={form.foundedYear}
          onChange={(e) => set("foundedYear", e.target.value)}
          placeholder="2023"
          min={1900}
          max={2030}
        />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="relative">
        <label className={labelCls}>Industry *</label>
        <input
          className={inputCls}
          value={form.industry}
          onChange={(e) => {
            set("industry", e.target.value);
            setIndustrySuggOpen(true);
          }}
          onFocus={() => setIndustrySuggOpen(true)}
          placeholder="e.g. Technology, Healthcare..."
        />
        {industrySuggOpen && filteredIndustries.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-white/10 bg-[#1A1A24] shadow-xl">
            {filteredIndustries.map((ind) => (
              <button
                key={ind}
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5"
                onClick={() => {
                  set("industry", ind);
                  setIndustrySuggOpen(false);
                }}
              >
                {ind}
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className={labelCls}>Sectors</label>
        <MultiSelectTags
          options={SECTOR_OPTIONS}
          selected={form.sectors}
          onToggle={(s) => toggleArrayItem("sectors", s)}
        />
      </div>
      <div>
        <label className={labelCls}>Business Model</label>
        <select className={selectCls} value={form.businessModel} onChange={(e) => set("businessModel", e.target.value)}>
          <option value="">Select...</option>
          {BUSINESS_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Revenue Model</label>
        <select className={selectCls} value={form.revenueModel} onChange={(e) => set("revenueModel", e.target.value)}>
          <option value="">Select...</option>
          {REVENUE_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Customer Type</label>
        <select className={selectCls} value={form.customerType} onChange={(e) => set("customerType", e.target.value)}>
          <option value="">Select...</option>
          {CUSTOMER_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Target Markets</label>
        <MultiSelectTags
          options={TARGET_MARKET_OPTIONS}
          selected={form.targetMarkets}
          onToggle={(s) => toggleArrayItem("targetMarkets", s)}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <CurrencyInput label="Monthly Revenue (MRR)" value={form.monthlyRevenue} onChange={(v) => set("monthlyRevenue", v)} />
      <CurrencyInput label="Annual Revenue (ARR)" value={form.annualRevenue} onChange={(v) => set("annualRevenue", v)} />
      <div>
        <label className={labelCls}>Revenue Growth Rate (MoM %)</label>
        <div className="relative">
          <input
            type="number"
            className={inputCls + " pr-8"}
            value={form.revenueGrowthRate}
            onChange={(e) => set("revenueGrowthRate", e.target.value)}
            placeholder="15"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40">%</span>
        </div>
      </div>
      <div>
        <label className={labelCls}>Users / Customers</label>
        <input
          type="number"
          className={inputCls}
          value={form.userCount}
          onChange={(e) => set("userCount", e.target.value)}
          placeholder="1000"
        />
      </div>
      <div>
        <label className={labelCls}>Team Size</label>
        <input
          type="number"
          className={inputCls}
          value={form.teamSize}
          onChange={(e) => set("teamSize", e.target.value)}
          placeholder="10"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Stage *</label>
        <select className={selectCls} value={form.stage} onChange={(e) => set("stage", e.target.value)}>
          <option value="">Select stage...</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <CurrencyInput label="Funding Target" value={form.fundingTarget} onChange={(v) => set("fundingTarget", v)} />
      <div>
        <label className={labelCls}>Deal Structure</label>
        <select className={selectCls} value={form.dealStructure} onChange={(e) => set("dealStructure", e.target.value)}>
          <option value="">Select...</option>
          {DEAL_STRUCTURES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <CurrencyInput label="Pre-Money Valuation (optional)" value={form.preMoneyValuation} onChange={(v) => set("preMoneyValuation", v)} />
      <CurrencyInput label="Previously Raised (optional)" value={form.previousRaised} onChange={(v) => set("previousRaised", v)} />
      <Toggle label="Has Lead Investor?" value={form.hasLeadInvestor} onChange={(v) => set("hasLeadInvestor", v)} />
      <Toggle label="Need a Lead?" value={form.leadNeeded} onChange={(v) => set("leadNeeded", v)} />
      <Toggle label="OK with Board Seat?" value={form.boardSeatOk} onChange={(v) => set("boardSeatOk", v)} />
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Number of Founders</label>
        <input
          type="number"
          className={inputCls}
          value={form.founderCount}
          onChange={(e) => set("founderCount", e.target.value)}
          placeholder="2"
          min={1}
          max={10}
        />
      </div>
      <Toggle label="Repeat Founder?" value={form.hasRepeatFounder} onChange={(v) => set("hasRepeatFounder", v)} />
      <Toggle label="Technical Founder?" value={form.hasTechnicalFounder} onChange={(v) => set("hasTechnicalFounder", v)} />
      <div>
        <label className={labelCls}>Diversity Characteristics <span className="text-white/30">(optional, used for matching with diversity-focused investors)</span></label>
        <MultiSelectTags
          options={DIVERSITY_OPTIONS}
          selected={form.founderDiversity}
          onToggle={(s) => toggleArrayItem("founderDiversity", s)}
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <label className={labelCls}>Preferred Investor Types</label>
        <MultiSelectTags
          options={INVESTOR_TYPES}
          selected={form.investorTypePrefs}
          onToggle={(s) => toggleArrayItem("investorTypePrefs", s)}
        />
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <h3 className="mb-3 text-sm font-semibold text-white/80">Profile Summary</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <SummaryRow label="Company" value={form.companyName} />
          <SummaryRow label="Country" value={COUNTRIES.find((c) => c.code === form.country)?.name || form.country} />
          <SummaryRow label="Industry" value={form.industry} />
          <SummaryRow label="Stage" value={form.stage} />
          <SummaryRow label="Business Model" value={form.businessModel} />
          <SummaryRow label="Revenue Model" value={form.revenueModel} />
          <SummaryRow label="Monthly Revenue" value={form.monthlyRevenue ? `${currencySymbol(form.currency)}${Number(form.monthlyRevenue).toLocaleString()}` : ""} />
          <SummaryRow label="Funding Target" value={form.fundingTarget ? `${currencySymbol(form.currency)}${Number(form.fundingTarget).toLocaleString()}` : ""} />
          <SummaryRow label="Team Size" value={form.teamSize} />
          <SummaryRow label="Sectors" value={form.sectors.join(", ")} />
          <SummaryRow label="Target Markets" value={form.targetMarkets.join(", ")} />
          <SummaryRow label="Investor Preferences" value={form.investorTypePrefs.join(", ")} />
        </div>
      </div>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen" style={{ background: "#0F0F14" }}>
      {/* Close dropdown on outside click */}
      {(countryOpen || industrySuggOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setCountryOpen(false); setIndustrySuggOpen(false); }}
        />
      )}

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Startup Profiles</h1>
              <p className="mt-1 text-sm text-white/40">
                {profiles.length === 0
                  ? "Create your first profile to get matched with relevant investors."
                  : limits.maxStartupProfiles === Infinity
                    ? `${profiles.length} profile${profiles.length === 1 ? "" : "s"}`
                    : `${profiles.length} of ${limits.maxStartupProfiles} profile${limits.maxStartupProfiles === 1 ? "" : "s"} used`}
              </p>
            </div>
            {canAddMore && profiles.length > 0 && (
              <button
                type="button"
                onClick={startNewProfile}
                className="flex items-center gap-1.5 rounded-lg bg-[#4361EE] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#3651DE]"
              >
                <Plus className="w-3.5 h-3.5" />
                New Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile selector tabs */}
        {profiles.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => selectProfile(p.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    editingProfileId === p.id
                      ? "border-[#4361EE] bg-[#4361EE]/20 text-[#4361EE]"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                  }`}
                >
                  {p.companyName}
                </button>
                <button
                  type="button"
                  onClick={() => deleteProfile(p.id)}
                  disabled={deleting === p.id}
                  className="p-1 rounded text-white/20 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete profile"
                >
                  {deleting === p.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
            {!editingProfileId && (
              <span className="rounded-lg border border-[#4361EE] bg-[#4361EE]/20 px-3 py-1.5 text-xs font-medium text-[#4361EE]">
                New Profile
              </span>
            )}
          </div>
        )}

        {/* Single profile with delete option */}
        {profiles.length === 1 && editingProfileId && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <span className="text-xs text-white/50">
              Editing: <span className="text-white/70 font-medium">{profiles[0].companyName}</span>
            </span>
            <button
              type="button"
              onClick={() => deleteProfile(profiles[0].id)}
              disabled={deleting === profiles[0].id}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              {deleting === profiles[0].id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              Delete
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEP_LABELS.map((label, i) => {
              const Icon = STEP_ICONS[i];
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition ${
                    isActive ? "text-[#4361EE]" : isDone ? "text-white/50" : "text-white/20"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-1 rounded-full bg-white/5">
            <div
              className="h-1 rounded-full bg-[#4361EE] transition-all duration-300"
              style={{ width: `${((step + 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Completeness */}
        <div className="mb-4 flex items-center gap-2 text-xs text-white/40">
          <span>Profile Completeness:</span>
          <span className="font-mono text-[#4361EE]">{pct}%</span>
          <div className="ml-2 h-1 w-24 rounded-full bg-white/5">
            <div
              className="h-1 rounded-full bg-[#4361EE] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="mb-4 text-sm font-semibold text-white/70">
            Step {step + 1}: {STEP_LABELS[step]}
          </h2>
          {stepRenderers[step]()}
        </div>

        {/* Error / saved feedback */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {saved && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Progress saved
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg bg-[#4361EE] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3651DE] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg bg-[#4361EE] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3651DE] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save & Find Matches
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary row                                                        */
/* ------------------------------------------------------------------ */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-white/40">{label}</span>
      <span className="text-white/70">{value || "\u2014"}</span>
    </>
  );
}
