import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { comparePassword } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// A precomputed bcrypt hash with no matching plaintext, compared against when the
// looked-up user doesn't exist. This keeps authorize()'s response time the same
// whether or not the email is registered, closing a user-enumeration timing side
// channel (an early return here would otherwise be measurably faster than a real
// bcrypt.compare against a stored hash).
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8s6y2UgeZbszTVwGE9RgTaXxDHFXm.";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 15 * 60, // 15 minutes
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        const ip = getClientIp((name) => req?.headers?.[name] as string | undefined);

        // Cap attempts per email and per IP so credential stuffing / brute force can't
        // run unbounded against a single account or from a single source.
        const withinEmailLimit = checkRateLimit(`login:email:${email}`, 5, 15 * 60 * 1000);
        const withinIpLimit = checkRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
        if (!withinEmailLimit || !withinIpLimit) {
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });

        // Always run a bcrypt compare, even for a nonexistent/inactive user, against a
        // fixed dummy hash so response time doesn't leak whether the email is registered.
        const isValid = await comparePassword(credentials.password, user?.password ?? DUMMY_HASH);

        if (!user || !user.isActive || !isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function dashboardPathForRole(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "guru":
      return "/dashboard/guru";
    case "siswa":
      return "/dashboard/siswa";
    case "orang_tua":
      return "/dashboard/orang-tua";
    default:
      return "/login";
  }
}
