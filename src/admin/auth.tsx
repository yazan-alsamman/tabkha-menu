import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { adminApi, ApiError } from "./api";
import type { AdminUser } from "./types";

type Value = {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<Value | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await adminApi.me();
      setUser(data.user);
    } catch (err) {
      setUser(null);
      if (err instanceof ApiError && err.status !== 401) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const data = await adminApi.login(email, password);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await adminApi.logout();
    setUser(null);
  }, []);

  const value = useMemo<Value>(
    () => ({ user, loading, error, login, logout, refresh }),
    [user, loading, error, login, logout, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminSession must be used within AdminAuthProvider");
  return ctx;
}
