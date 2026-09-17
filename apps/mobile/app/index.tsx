import { Redirect } from "expo-router";

// A concrete root route for the Stack to resolve to on first paint; the root
// layout's AuthGate immediately corrects this to "(tabs)" if a session
// already exists (see app/_layout.tsx).
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
