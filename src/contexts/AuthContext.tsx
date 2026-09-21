import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase';

type AuthValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    meta?: { full_name?: string; account_type?: string; city?: string; handle?: string },
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: supabaseConfigured,
      signIn: async (email, password) => {
        if (!supabase) return { error: 'Auth is not configured yet. Add the Pet Angels Supabase publishable key.' };
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        return error ? { error: error.message } : {};
      },
      signUp: async (email, password, meta) => {
        if (!supabase) return { error: 'Auth is not configured yet. Add the Pet Angels Supabase publishable key.' };
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: meta?.full_name || '',
              account_type: meta?.account_type || 'pet_parent',
              city: meta?.city || '',
              handle: meta?.handle || '',
              ecosystem_from: 'pet-angels',
            },
          },
        });
        return error ? { error: error.message } : {};
      },
      signOut: async () => {
        if (supabase) await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
