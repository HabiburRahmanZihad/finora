import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { jwtClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

// Points at apps/client, since that's where Better Auth's server config and
// its /api/auth/* routes actually live (see apps/client/src/lib/auth.ts) —
// apps/server has no auth routes of its own, only JWT verification.
const AUTH_BASE_URL = process.env.EXPO_PUBLIC_AUTH_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: AUTH_BASE_URL,
  plugins: [
    expoClient({
      scheme: "finora",
      storagePrefix: "finora",
      storage: SecureStore,
    }),
    jwtClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
