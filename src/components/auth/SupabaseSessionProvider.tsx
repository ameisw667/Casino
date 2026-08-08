'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface SupabaseSessionContextValue {
  user: User | null;
  isLoaded: boolean;
  signOut: () => Promise<void>;
}

const SupabaseSessionContext = createContext<SupabaseSessionContextValue | null>(null);

export function SupabaseSessionProvider({ children, initialUser = null }: { children: ReactNode; initialUser?: User | null }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoaded, setIsLoaded] = useState(!!initialUser);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        document.cookie = 'casino_signed_out=; path=/; max-age=0';
        setUser(data.session.user);
      }
      setIsLoaded(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        document.cookie = 'casino_signed_out=; path=/; max-age=0';
      }
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const value = useMemo<SupabaseSessionContextValue>(() => ({
    user,
    isLoaded,
    signOut: async () => {
      document.cookie = 'casino_signed_out=1; path=/; max-age=86400';
      setUser(null);
      await supabase.auth.signOut();
    },
  }), [user, isLoaded, supabase]);

  return <SupabaseSessionContext.Provider value={value}>{children}</SupabaseSessionContext.Provider>;
}

export function useSupabaseSession(): SupabaseSessionContextValue {
  const ctx = useContext(SupabaseSessionContext);
  if (!ctx) throw new Error('useSupabaseSession must be used within SupabaseSessionProvider');
  return ctx;
}
