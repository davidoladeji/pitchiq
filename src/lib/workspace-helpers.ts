import { prisma } from "@/lib/db";

/**
 * Verify that a user is a member of a workspace and return both the workspace and membership.
 */
export async function getWorkspaceAndMember(slug: string, userId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: {
        where: { userId },
        take: 1,
      },
    },
  });

  if (!workspace) return null;

  const member = workspace.members[0] || null;

  // Owner is always a member even without a WorkspaceMember record
  const isOwner = workspace.ownerId === userId;
  const effectiveRole = isOwner ? "owner" : member?.role || null;

  return {
    workspace,
    member,
    isOwner,
    role: effectiveRole,
    isMember: isOwner || !!member,
  };
}

/**
 * Check if a user can manage a workspace (owner or editor).
 */
export function canManage(role: string | null): boolean {
  return role === "owner" || role === "editor";
}

/**
 * Check if user can admin (owner only).
 */
export function canAdmin(role: string | null): boolean {
  return role === "owner";
}
