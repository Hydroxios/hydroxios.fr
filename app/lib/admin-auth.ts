import { getServerSession, type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { isAdmin } from "./admin-policy";

export function authConfigured() {
  try {
    const url = new URL(process.env.NEXTAUTH_URL ?? "");
    const secure = url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
    return secure && (process.env.NEXTAUTH_SECRET?.length ?? 0) >= 32 && !!process.env.DISCORD_CLIENT_ID && !!process.env.DISCORD_CLIENT_SECRET && isAdmin(process.env.ADMIN_DISCORD_ID);
  } catch { return false; }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [DiscordProvider({
    clientId: process.env.DISCORD_CLIENT_ID ?? "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    authorization: { params: { scope: "identify" } },
    checks: ["pkce", "state"],
  })],
  pages: { signIn: "/dashboard/login", error: "/dashboard/login" },
  callbacks: {
    async signIn({ account }) {
      return authConfigured() && account?.provider === "discord" && isAdmin(account.providerAccountId);
    },
    async jwt({ token, account }) {
      if (account) token.discordId = account.provider === "discord" ? account.providerAccountId : undefined;
      return token;
    },
    async session({ session, token }) {
      // Recheck the allowlist on every request, including existing sessions.
      session.adminId = isAdmin(token.discordId) ? String(token.discordId) : undefined;
      return session;
    },
    async redirect({ url, baseUrl }) {
      try { if (new URL(url, baseUrl).origin === new URL(baseUrl).origin) return new URL(url, baseUrl).href; } catch {}
      return `${baseUrl}/dashboard`;
    },
  },
};

export async function adminSession() {
  if (!authConfigured()) return null;
  const session = await getServerSession(authOptions);
  return session && isAdmin(session.adminId) ? session : null;
}
