import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { jwt, admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { prisma } from "@finora/database";

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      // TODO: wire up a real email provider (Resend/SMTP) before production.
      // For now the reset link is logged so the flow is testable locally.
      console.log(`[finora] Password reset link for ${user.email}: ${url}`);
    },
  },

  // Add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to apps/client/.env.local to enable.
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : undefined,

  // Issues short-lived JWTs (GET /api/auth/token) + a JWKS endpoint
  // (GET /api/auth/jwks) that apps/server verifies against. See
  // apps/server/src/auth/jwt-verifier.service.ts. The jwt plugin's default
  // payload is the full session user object, so `role` (added by the admin
  // plugin below) flows into the token automatically.
  plugins: [
    jwt({
      jwt: {
        expirationTime: "15m",
      },
      jwks: {
        keyPairConfig: { alg: "RS256" },
      },
    }),
    // Adds role/ban fields to User + admin APIs (listUsers, setUserPassword,
    // setRole, banUser, ...). defaultRole "user" / adminRoles ["admin"] are
    // the built-in defaults and match the seeded admin@finora.com account.
    admin(),
    // Lets apps/mobile's expoClient() talk to this same Better Auth instance
    // (trusts the app's "finora://" deep-link scheme as an origin, and
    // adjusts cookie handling for React Native's fetch instead of a browser).
    expo(),
  ],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.userSettings.create({ data: { userId: user.id } });
        },
      },
    },
  },
});
