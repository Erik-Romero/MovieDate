import { createClient } from '@neondatabase/neon-js';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

// The React adapter is what gives you neon.auth.useSession(). Without it you
// only get the promise-based getSession() and have to wire your own state.
// Note the subpath import — it is NOT exported from the main entry.
export const neon = createClient({
  auth: {
    url: import.meta.env.VITE_NEON_AUTH_URL,
    adapter: BetterAuthReactAdapter(),
  },
  dataApi: {
    url: import.meta.env.VITE_NEON_DATA_API_URL,
  },
});

// Convenience wrapper so components don't reach into neon.auth directly.
export function useAuth() {
  const session = neon.auth.useSession();
  return {
    user: session.data?.user ?? null,
    isPending: session.isPending,
    signOut: () => neon.auth.signOut(),
  };
}
