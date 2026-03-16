import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * DELETE /api/admin/decks/[id]
 * Delete a deck and all associated data.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete views first (foreign key constraint)
    await prisma.view.deleteMany({ where: { deckId: params.id } });
    // Delete the deck
    await prisma.deck.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Admin Delete Deck]", err);
    return NextResponse.json({ error: "Failed to delete deck" }, { status: 500 });
  }
}
