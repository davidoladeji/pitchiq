import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(process.env.LINKEDIN_CLIENT_ID
      ? [
          LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Auto-link OAuth accounts when email matches an existing user
      if (account?.provider && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });
        if (existingUser) {
          const alreadyLinked = existingUser.accounts.some(
            (a) => a.provider === account.provider,
          );
          if (!alreadyLinked) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }
          // Update profile image / name if missing
          if (!existingUser.image && (profile as { picture?: string })?.picture) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { image: (profile as { picture?: string }).picture },
            });
          }
        }
      }
      // Record last-seen timestamp for audit trail (non-blocking – must not break login)
      if (user.email) {
        try {
          const target = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true } });
          if (target) {
            await prisma.user.update({ where: { id: target.id }, data: { lastSeenAt: new Date() } });
          }
        } catch (e) {
          console.warn("Failed to update lastSeenAt:", e);
        }
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        (session.user as { id?: string }).id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
