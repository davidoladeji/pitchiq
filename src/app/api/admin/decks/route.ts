import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Allowed sort fields — anything else falls back to createdAt */
const ALLOWED_SORT_FIELDS = new Set([
  "createdAt", "updatedAt", "title", "companyName", "piqScore",
]);

/**
 * GET /api/admin/decks
 * List all decks with pagination and search.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const search = (url.searchParams.get("search") || "").trim();
  const sortByRaw = url.searchParams.get("sort") || "createdAt";
  const sortBy = ALLOWED_SORT_FIELDS.has(sortByRaw) ? sortByRaw : "createdAt";
  const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";

  // Build where clause — only add search filter if search string is non-empty
  // Separate the owner email search to avoid issues with nullable relation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let where: any = {};
  if (search) {
    where = {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { companyName: { contains: search, mode: "insensitive" as const } },
        { shareId: { contains: search, mode: "insensitive" as const } },
        { owner: { is: { email: { contains: search, mode: "insensitive" as const } } } },
      ],
    };
  }

  try {
    const [decks, total] = await Promise.all([
      prisma.deck.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          shareId: true,
          title: true,
          companyName: true,
          themeId: true,
          isPremium: true,
          piqScore: true,
          createdAt: true,
          owner: { select: { email: true } },
          _count: { select: { views: true } },
        },
      }),
      prisma.deck.count({ where }),
    ]);

    const serialized = decks.map((d) => ({
      id: d.id,
      shareId: d.shareId,
      title: d.title,
      companyName: d.companyName,
      themeId: d.themeId,
      isPremium: d.isPremium,
      piqScore: d.piqScore,
      createdAt: d.createdAt.toISOString(),
      userEmail: d.owner?.email || "Unknown",
      viewCount: d._count.views,
    }));

    return NextResponse.json({
      decks: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[Admin Decks]", err);
    return NextResponse.json({ error: "Failed to load decks" }, { status: 500 });
  }
}
