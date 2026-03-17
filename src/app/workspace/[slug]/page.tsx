import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import WorkspaceDashboardClient from "@/components/workspace/WorkspaceDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workspace | PitchIQ",
  description:
    "Manage workspace decks, members, and collaboration. Share and present pitch decks.",
};

export default async function WorkspacePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.slug },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      decks: {
        select: {
          id: true,
          shareId: true,
          title: true,
          companyName: true,
          themeId: true,
          piqScore: true,
          createdAt: true,
          _count: { select: { views: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { invites: { where: { accepted: false, expiresAt: { gt: new Date() } } } },
      },
    },
  });

  if (!workspace) {
    notFound();
  }

  // Check membership
  const isMember = workspace.members.some((m) => m.userId === session.user!.id);
  const isOwner = workspace.ownerId === session.user.id;

  if (!isMember && !isOwner) {
    notFound();
  }

  const currentMember = workspace.members.find((m) => m.userId === session.user!.id);
  const role = isOwner ? "owner" : currentMember?.role || "viewer";

  return (
    <WorkspaceDashboardClient
      workspace={{
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        role,
        isOwner,
        members: workspace.members.map((m) => ({
          id: m.id,
          userId: m.userId,
          name: m.user.name || m.user.email || "Unknown",
          email: m.user.email || "",
          image: m.user.image || null,
          role: m.role,
        })),
        decks: workspace.decks.map((d) => ({
          id: d.id,
          shareId: d.shareId,
          title: d.title,
          companyName: d.companyName,
          themeId: d.themeId,
          piqScore: d.piqScore,
          createdAt: d.createdAt.toISOString(),
          viewCount: d._count.views,
        })),
        pendingInvites: workspace._count.invites,
      }}
    />
  );
}
