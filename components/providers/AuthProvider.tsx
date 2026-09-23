"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/server/types";
import { isProfileComplete } from "@/lib/utils/profile";

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isComplete: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isComplete: false,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const activeUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchProfile = useCallback(
    async (token: string, force = false) => {
      if (!token) return;
      if (isFetchingRef.current && !force) return;

      isFetchingRef.current = true;
      try {
        const res = await fetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const json = await res.json();
          setProfile(json.data?.profile ?? null);
        }
      } catch (err) {
        console.error("[AUTH PROVIDER] Failed to fetch profile:", err);
      } finally {
        isFetchingRef.current = false;
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetchProfile(session.access_token, true);
      }
    } catch (err) {
      console.error("[AUTH PROVIDER] Refresh profile failed:", err);
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Single auth state subscription handles initial session and all changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const sessionUser = session?.user ?? null;
      const sessionToken = session?.access_token ?? "";

      setUser(sessionUser);

      if (sessionUser && sessionToken) {
        // Only fetch if user changed or profile not loaded yet
        if (activeUserIdRef.current !== sessionUser.id) {
          activeUserIdRef.current = sessionUser.id;
          await fetchProfile(sessionToken, false);
        }
      } else {
        activeUserIdRef.current = null;
        setProfile(null);
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const logout = useCallback(async () => {
    setLoading(true);
    activeUserIdRef.current = null;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  }, [supabase]);

  const isComplete = useMemo(() => isProfileComplete(profile), [profile]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isComplete,
      loading,
      logout,
      refreshProfile,
    }),
    [user, profile, isComplete, loading, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

