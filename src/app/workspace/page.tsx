import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import WorkspaceListClient from "@/components/workspace/WorkspaceListClient";

export const dynamic = "force-dynamic";

export default async function WorkspaceListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true, decks: true } },
          owner: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role,
    isOwner: m.workspace.ownerId === session.user!.id,
    memberCount: m.workspace._count.members,
    deckCount: m.workspace._count.decks,
    ownerName: m.workspace.owner.name || m.workspace.owner.email || "Unknown",
  }));

  return (
    <WorkspaceListClient
      workspaces={workspaces}
      plan={user?.plan || "starter"}
    />
  );
}
