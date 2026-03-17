import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation — PitchIQ",
  description: "REST API documentation for PitchIQ deck generation and scoring.",
};

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-navy-700/50 bg-navy-950">
      {title && (
        <div className="px-4 py-2 bg-navy-800/50 border-b border-navy-700/50 text-xs font-mono text-navy-400">
          {title}
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-navy-200">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <span className="w-1 h-6 bg-electric rounded-full inline-block" />
        {title}
      </h2>
      <div className="space-y-4 text-navy-300 leading-relaxed">{children}</div>
    </section>
  );
}

function Endpoint({
  method,
  path,
  description,
  scope,
  children,
}: {
  method: string;
  path: string;
  description: string;
  scope?: string;
  children?: React.ReactNode;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-emerald/15 text-emerald border-emerald/20",
    POST: "bg-electric/10 text-electric border-electric/20",
    DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <div className="rounded-xl border border-navy-700/50 bg-navy-900/50 p-5">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-md border ${methodColors[method] || "bg-navy-800 text-navy-300"}`}
        >
          {method}
        </span>
        <code className="text-sm font-mono text-white">{path}</code>
        {scope && (
          <span className="text-[11px] font-mono text-electric bg-electric/10 px-2 py-0.5 rounded">
            scope: {scope}
          </span>
        )}
      </div>
      <p className="text-sm text-navy-400 mb-3">{description}</p>
      {children}
    </div>
  );
}

export default function ApiDocsPage() {
  const baseUrl = "https://getpitchiq.com";

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Header */}
      <header className="border-b border-navy-800/50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <a href="/" className="text-electric hover:underline text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 rounded">
              PitchIQ
            </a>
            <span className="text-navy-600">/</span>
            <span className="text-navy-400 text-sm">API Docs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            API Reference
          </h1>
          <p className="mt-2 text-navy-400 max-w-2xl">
            Programmatic access to PitchIQ deck generation and scoring.
            Available on the Enterprise plan.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Table of contents */}
        <nav className="flex flex-wrap gap-3">
          {["Authentication", "API Keys", "Decks", "Scoring", "Rate Limits"].map(
            (s) => (
              <a
                key={s}
                href={`#${s.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm px-3 py-1.5 rounded-lg bg-navy-800/50 text-navy-300 hover:text-white hover:bg-navy-700/50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
              >
                {s}
              </a>
            )
          )}
        </nav>

        {/* Authentication */}
        <Section id="authentication" title="Authentication">
          <p>
            All API requests require a valid API key passed in the{" "}
            <code className="text-electric text-sm">Authorization</code> header.
          </p>
          <CodeBlock title="Header format">
            {`Authorization: Bearer piq_your_api_key_here`}
          </CodeBlock>
          <p>
            API keys are created from the dashboard. Each key is shown once on creation
            -- store it securely. Keys can be scoped to specific operations.
          </p>
          <div className="rounded-xl border border-navy-700/50 bg-navy-900/50 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Available Scopes</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-navy-400">
                  <th className="pb-2 pr-4 font-medium">Scope</th>
                  <th className="pb-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-navy-300">
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs text-electric">decks:read</td>
                  <td>List and view decks</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs text-electric">decks:write</td>
                  <td>Create and delete decks</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs text-electric">score</td>
                  <td>Score uploaded deck files</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs text-electric">batch</td>
                  <td>Batch scoring operations</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* API Keys */}
        <Section id="api-keys" title="API Keys">
          <p>
            Manage API keys through the dashboard or via these session-authenticated endpoints.
          </p>

          <Endpoint method="GET" path="/api/api-keys" description="List all your API keys.">
            <CodeBlock title="Response">{`{
  "keys": [
    {
      "id": "uuid",
      "name": "My Key",
      "keyPrefix": "piq_abc1",
      "scopes": "[\"decks:read\",\"decks:write\",\"score\"]",
      "lastUsedAt": "2026-03-15T12:00:00.000Z",
      "createdAt": "2026-03-01T00:00:00.000Z",
      "revoked": false
    }
  ]
}`}</CodeBlock>
          </Endpoint>

          <Endpoint method="POST" path="/api/api-keys" description="Create a new API key. The raw key is returned once.">
            <CodeBlock title="Request body">{`{
  "name": "Production Key",
  "scopes": ["decks:read", "decks:write", "score"]
}`}</CodeBlock>
            <CodeBlock title="Response">{`{
  "id": "uuid",
  "name": "Production Key",
  "key": "piq_a1b2c3d4e5f6...",
  "keyPrefix": "piq_a1b2",
  "scopes": ["decks:read", "decks:write", "score"],
  "createdAt": "2026-03-16T00:00:00.000Z"
}`}</CodeBlock>
          </Endpoint>

          <Endpoint method="DELETE" path="/api/api-keys/:id" description="Revoke an API key. This is irreversible." />
        </Section>

        {/* Decks */}
        <Section id="decks" title="Decks">
          <Endpoint
            method="GET"
            path="/api/v1/decks"
            description="List all your decks."
            scope="decks:read"
          >
            <CodeBlock title="curl">{`curl -H "Authorization: Bearer piq_your_key" \\
  ${baseUrl}/api/v1/decks`}</CodeBlock>
            <CodeBlock title="Response">{`{
  "decks": [
    {
      "id": "uuid",
      "shareId": "abc123def4",
      "title": "Acme Pitch Deck",
      "companyName": "Acme Corp",
      "themeId": "midnight",
      "piqScore": { "overall": 82, "grade": "B+", ... },
      "createdAt": "2026-03-16T00:00:00.000Z"
    }
  ]
}`}</CodeBlock>
          </Endpoint>

          <Endpoint
            method="POST"
            path="/api/v1/decks"
            description="Generate a new pitch deck with AI."
            scope="decks:write"
          >
            <CodeBlock title="curl">{`curl -X POST -H "Authorization: Bearer piq_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "companyName": "Acme Corp",
    "industry": "SaaS",
    "stage": "Seed",
    "fundingTarget": "$2M",
    "investorType": "vc",
    "problem": "Developers waste 40% of time on boilerplate.",
    "solution": "AI code generation that writes production-ready code."
  }' \\
  ${baseUrl}/api/v1/decks`}</CodeBlock>
            <CodeBlock title="JavaScript">{`const res = await fetch("${baseUrl}/api/v1/decks", {
  method: "POST",
  headers: {
    "Authorization": "Bearer piq_your_key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    companyName: "Acme Corp",
    industry: "SaaS",
    stage: "Seed",
    fundingTarget: "$2M",
    investorType: "vc",
    problem: "Developers waste 40% of time on boilerplate.",
    solution: "AI code generation that writes production-ready code.",
  }),
});
const deck = await res.json();`}</CodeBlock>
            <CodeBlock title="Response">{`{
  "id": "uuid",
  "shareId": "abc123def4",
  "title": "Acme Corp Pitch Deck",
  "companyName": "Acme Corp",
  "slides": [ { "title": "...", "content": [...], ... } ],
  "piqScore": { "overall": 85, "grade": "B+", "dimensions": [...] },
  "createdAt": "2026-03-16T00:00:00.000Z"
}`}</CodeBlock>
          </Endpoint>

          <Endpoint
            method="GET"
            path="/api/v1/decks/:shareId"
            description="Get a single deck with full slides and score."
            scope="decks:read"
          >
            <CodeBlock title="curl">{`curl -H "Authorization: Bearer piq_your_key" \\
  ${baseUrl}/api/v1/decks/abc123def4`}</CodeBlock>
            <CodeBlock title="Response">{`{
  "id": "uuid",
  "shareId": "abc123def4",
  "title": "Acme Corp Pitch Deck",
  "companyName": "Acme Corp",
  "industry": "SaaS",
  "stage": "Seed",
  "fundingTarget": "$2M",
  "investorType": "vc",
  "themeId": "midnight",
  "slides": [...],
  "piqScore": { "overall": 85, "grade": "B+", "dimensions": [...] },
  "source": "api",
  "createdAt": "2026-03-16T00:00:00.000Z",
  "updatedAt": "2026-03-16T00:00:00.000Z"
}`}</CodeBlock>
          </Endpoint>

          <Endpoint
            method="DELETE"
            path="/api/v1/decks/:shareId"
            description="Delete a deck permanently."
            scope="decks:write"
          >
            <CodeBlock title="curl">{`curl -X DELETE -H "Authorization: Bearer piq_your_key" \\
  ${baseUrl}/api/v1/decks/abc123def4`}</CodeBlock>
            <CodeBlock title="Response">{`{ "success": true, "deletedId": "uuid" }`}</CodeBlock>
          </Endpoint>
        </Section>

        {/* Scoring */}
        <Section id="scoring" title="Scoring">
          <Endpoint
            method="POST"
            path="/api/v1/score"
            description="Upload a PDF or PPTX file and get a PIQ score. Optionally save it as a deck."
            scope="score"
          >
            <CodeBlock title="curl">{`curl -X POST -H "Authorization: Bearer piq_your_key" \\
  -F "file=@pitch.pdf" \\
  -F "companyName=Acme Corp" \\
  -F "saveDeck=true" \\
  ${baseUrl}/api/v1/score`}</CodeBlock>
            <CodeBlock title="JavaScript">{`const form = new FormData();
form.append("file", fileBlob, "pitch.pdf");
form.append("companyName", "Acme Corp");
form.append("saveDeck", "true");

const res = await fetch("${baseUrl}/api/v1/score", {
  method: "POST",
  headers: { "Authorization": "Bearer piq_your_key" },
  body: form,
});
const result = await res.json();`}</CodeBlock>
            <CodeBlock title="Response">{`{
  "piqScore": {
    "overall": 78,
    "grade": "B+",
    "dimensions": [
      { "id": "narrative", "score": 82, "label": "Narrative & Story" },
      { "id": "market", "score": 75, "label": "Market Opportunity" },
      ...
    ],
    "strengths": ["Clear problem statement", ...],
    "improvements": ["Add more traction data", ...]
  },
  "slideCount": 12,
  "companyName": "Acme Corp",
  "deckId": "uuid",
  "shareId": "abc123def4"
}`}</CodeBlock>
          </Endpoint>
        </Section>

        {/* Rate Limits */}
        <Section id="rate-limits" title="Rate Limits">
          <p>
            API requests are rate-limited per key. The Enterprise plan allows{" "}
            <strong className="text-white">100 requests per minute</strong> per API key.
          </p>
          <div className="rounded-xl border border-navy-700/50 bg-navy-900/50 p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-navy-400">
                  <th className="pb-2 pr-4 font-medium">Limit</th>
                  <th className="pb-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="text-navy-300">
                <tr>
                  <td className="py-1.5 pr-4">Requests per minute</td>
                  <td>100</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4">Max API keys</td>
                  <td>10</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4">Max file upload size</td>
                  <td>100 MB</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            When rate limited, the API returns a{" "}
            <code className="text-electric text-sm">429</code> status code.
          </p>
          <CodeBlock title="429 Response">{`{ "error": "Rate limit exceeded. Please slow down." }`}</CodeBlock>
        </Section>

        {/* Error format */}
        <Section id="errors" title="Error Responses">
          <p>
            All errors follow a consistent format with an HTTP status code and JSON body.
          </p>
          <CodeBlock title="Error format">{`{
  "error": "Human-readable error message"
}`}</CodeBlock>
          <div className="rounded-xl border border-navy-700/50 bg-navy-900/50 p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-navy-400">
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Meaning</th>
                </tr>
              </thead>
              <tbody className="text-navy-300">
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs">400</td>
                  <td>Bad request (missing or invalid parameters)</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs">401</td>
                  <td>Invalid, expired, or missing API key</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs">403</td>
                  <td>Insufficient plan or missing scope</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs">404</td>
                  <td>Resource not found</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs">422</td>
                  <td>Unprocessable file (corrupt or insufficient text)</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs">429</td>
                  <td>Rate limit exceeded</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs">500</td>
                  <td>Internal server error</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4 font-mono text-xs">502</td>
                  <td>AI scoring service failed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* Footer */}
        <div className="border-t border-navy-800/50 pt-8 text-center text-navy-500 text-sm">
          <p>
            Need help? Contact{" "}
            <a href="mailto:support@getpitchiq.com" className="text-electric hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 rounded">
              support@getpitchiq.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
