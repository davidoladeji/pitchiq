/** Exhaustive list of startup industries for the deck generator. */
export const INDUSTRIES = [
  // Technology & Software
  "Artificial Intelligence / Machine Learning",
  "SaaS (Software as a Service)",
  "Cloud Computing / Infrastructure",
  "Cybersecurity",
  "Data Analytics / Business Intelligence",
  "DevOps / Developer Tools",
  "Enterprise Software",
  "Low-Code / No-Code Platforms",
  "Robotics / Automation",
  "Quantum Computing",
  "Blockchain / Web3",
  "AR / VR / Spatial Computing",
  "IoT (Internet of Things)",
  "API / Platform Infrastructure",
  "Open Source Software",

  // Finance
  "FinTech",
  "InsurTech",
  "WealthTech / Investing",
  "Payments / Billing",
  "Banking / Neobanking",
  "Lending / Credit",
  "Crypto / Digital Assets",
  "RegTech / Compliance",
  "Accounting / Tax Tech",
  "B2B Payments / Invoicing",

  // Health & Life Sciences
  "HealthTech / Digital Health",
  "BioTech / Life Sciences",
  "MedTech / Medical Devices",
  "Mental Health / Wellness",
  "Telehealth / Virtual Care",
  "Genomics / Personalized Medicine",
  "Pharmaceutical / Drug Discovery",
  "Fitness / Wearables",
  "ElderCare / AgeTech",
  "FemTech / Women's Health",
  "Veterinary / Animal Health",

  // E-Commerce & Retail
  "E-Commerce",
  "D2C (Direct-to-Consumer)",
  "Marketplace",
  "Retail Tech / Point of Sale",
  "Social Commerce",
  "Subscription Commerce",
  "Luxury / Fashion Tech",
  "Beauty / Personal Care",
  "Grocery / Online Food Retail",

  // Food & Agriculture
  "FoodTech",
  "AgTech / Precision Agriculture",
  "Food Delivery / Logistics",
  "Restaurant Tech",
  "Alternative Proteins / Plant-Based",
  "Beverage / CPG",
  "Supply Chain / Cold Chain",

  // Education
  "EdTech",
  "Corporate Training / L&D",
  "Online Learning Platforms",
  "K-12 Education",
  "Higher Education Tech",
  "Language Learning",
  "Tutoring / Test Prep",
  "Skills / Credentialing",

  // Real Estate & Construction
  "PropTech / Real Estate Tech",
  "Construction Tech / ConTech",
  "Smart Buildings / Facilities",
  "Mortgage / Home Buying",
  "Property Management",
  "Commercial Real Estate",
  "Co-Living / Co-Working",

  // Transportation & Mobility
  "Mobility / Transportation",
  "Electric Vehicles / EV Infrastructure",
  "Autonomous Vehicles",
  "Logistics / Fleet Management",
  "Last-Mile Delivery",
  "Ride-Sharing / Micromobility",
  "Aerospace / Space Tech",
  "Drone Technology",
  "Maritime / Shipping Tech",

  // Energy & Sustainability
  "CleanTech / Climate Tech",
  "Renewable Energy",
  "Energy Storage / Batteries",
  "Carbon Capture / Offsets",
  "Circular Economy / Recycling",
  "Water / Waste Management",
  "Smart Grid / Energy Management",
  "Sustainable Fashion / Materials",

  // Media & Entertainment
  "Media / Content",
  "Gaming / Esports",
  "Music Tech",
  "Video / Streaming",
  "Podcasting / Audio",
  "Creator Economy",
  "Digital Advertising / AdTech",
  "Publishing / Journalism",
  "Sports Tech / Fan Engagement",

  // Marketing & Sales
  "MarTech / Marketing Automation",
  "Sales Enablement / CRM",
  "Influencer Marketing",
  "SEO / Content Marketing",
  "Email / Messaging Platforms",
  "Customer Success / Support",
  "Conversational AI / Chatbots",
  "Loyalty / Rewards Programs",

  // HR & Work
  "HRTech / People Operations",
  "Recruiting / Talent Acquisition",
  "Payroll / Benefits",
  "Remote Work / Collaboration",
  "Freelance / Gig Economy",
  "Workforce Management",
  "Employee Engagement / Culture",
  "Background Checks / Verification",

  // Legal & Government
  "LegalTech",
  "GovTech / Civic Tech",
  "Regulatory / Policy Tech",
  "Contract Management",
  "IP / Patent Tech",
  "Identity / KYC / Verification",

  // Travel & Hospitality
  "Travel Tech",
  "Hospitality / Hotels",
  "Event Tech / Ticketing",
  "Tourism / Experiences",
  "Airline / Aviation Tech",
  "Business Travel Management",

  // Social & Communication
  "Social Networking",
  "Dating / Relationships",
  "Community Platforms",
  "Messaging / Communication",
  "Video Conferencing",
  "Social Impact / Nonprofit Tech",

  // Manufacturing & Industrial
  "Manufacturing / Industry 4.0",
  "3D Printing / Additive Manufacturing",
  "Supply Chain / Procurement",
  "Quality Control / Inspection",
  "Industrial IoT / SCADA",
  "Materials Science",

  // Security & Safety
  "Physical Security / Surveillance",
  "Personal Safety Tech",
  "Emergency Response / FirstNet",
  "Fire / Safety Compliance",

  // Consumer Services
  "Home Services / Maintenance",
  "Cleaning / Laundry Tech",
  "Pet Care / Pet Tech",
  "Parenting / Family Tech",
  "Personal Finance / Budgeting",
  "Moving / Storage",
  "Automotive Services / CarTech",

  // Other
  "DeepTech / Hard Science",
  "Defense / Military Tech",
  "Non-Profit / Social Enterprise",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];
