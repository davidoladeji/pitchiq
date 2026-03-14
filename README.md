# PitchIQ

**AI-powered pitch deck generator for founders raising capital.**

Generate investor-ready pitch decks in 60 seconds. Open-source core with premium analytics.

## Features

- **AI Deck Generation** — Describe your startup, get a polished 10-12 slide pitch deck
- **Investor-Type Targeting** — Decks optimized for VC, angel, or accelerator audiences
- **Slide Renderer** — Presentation-quality slides rendered in the browser
- **PDF Export** — Download decks as polished PDFs
- **Shareable Links** — Every deck gets a unique URL with "Made with PitchIQ" branding
- **View Analytics** (Premium) — Track who opened your deck and which slides they read
- **A/B Testing** (Premium) — Generate variants and track which story converts better

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude API
- SQLite via Prisma
- jsPDF for exports

## Quick Start

```bash
# Clone the repo
git clone https://github.com/davidoladeji/pitchiq.git
cd pitchiq

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Initialize database
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start generating pitch decks.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite database path (default: `file:./dev.db`) |
| `ANTHROPIC_API_KEY` | No | Claude API key for AI generation (uses fallback templates without it) |
| `STRIPE_SECRET_KEY` | No | Stripe key for premium payments |
| `NEXT_PUBLIC_APP_URL` | No | Public URL for shareable links |

## Docker

```bash
# Build and run
docker compose up --build

# Or manually
docker build -t pitchiq .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=your-key pitchiq
```

## Project Structure

```
pitchiq/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Landing page
│   │   ├── create/page.tsx   # Deck creation form + viewer
│   │   ├── deck/[shareId]/   # Public deck viewer
│   │   └── api/decks/        # API routes
│   ├── components/           # React components
│   │   ├── DeckForm.tsx      # Input form
│   │   └── SlideRenderer.tsx # Slide presentation viewer
│   └── lib/                  # Utilities
│       ├── db.ts             # Prisma client
│       ├── generate-deck.ts  # AI deck generation
│       └── types.ts          # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
├── Dockerfile
├── docker-compose.yml
└── LICENSE                   # MIT
```

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT License. See [LICENSE](./LICENSE) for details.
