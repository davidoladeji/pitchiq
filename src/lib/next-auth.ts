import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
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
    // Dev-only credentials login (bypasses OAuth for local development)
    ...(process.env.NODE_ENV === "development"
      ? [
          CredentialsProvider({
            id: "dev-login",
            name: "Dev Login",
            credentials: {
              email: { label: "Email", type: "email", placeholder: "dev@pitchiq.local" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;
              // Find or create user in local DB
              let user = await prisma.user.findUnique({ where: { email: credentials.email } });
              if (!user) {
                user = await prisma.user.create({
                  data: {
                    email: credentials.email,
                    name: credentials.email.split("@")[0],
                    plan: "enterprise", // Full access for dev testing
                  },
                });
              }
              return { id: user.id, email: user.email, name: user.name };
            },
          }),
        ]
      : []),
  ],
  session: {
    // CredentialsProvider requires JWT strategy; use database for production OAuth
    strategy: process.env.NODE_ENV === "development" ? "jwt" : "database",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Auto-link OAuth accounts when email matches an existing user.
      // This runs BEFORE the adapter's built-in linking check, ensuring
      // that the account record exists so the adapter doesn't throw
      // OAuthAccountNotLinked.
      if (account?.provider && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          });
          if (existingUser) {
            const alreadyLinked = existingUser.accounts.some(
              (a) => a.provider === account.provider && a.providerAccountId === account.providerAccountId,
            );
            if (!alreadyLinked) {
              // Check if this providerAccountId already exists (prevent unique constraint violation)
              const existingAccount = await prisma.account.findFirst({
                where: { provider: account.provider, providerAccountId: account.providerAccountId },
              });
              if (!existingAccount) {
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
            }
            // Update profile image / name if missing
            if (!existingUser.image && (profile as { picture?: string })?.picture) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: (profile as { picture?: string }).picture },
              });
            }
          }
        } catch (linkError) {
          // Log but don't block sign-in — the adapter may handle it
          console.warn("[next-auth] Account linking error (non-blocking):", linkError);
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
    async jwt({ token, user }) {
      // Store user ID in JWT token (needed for credentials/dev login)
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, user, token }) {
      if (session.user) {
        // Database strategy provides `user`, JWT strategy provides `token`
        (session.user as { id?: string }).id = user?.id || token?.sub || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
