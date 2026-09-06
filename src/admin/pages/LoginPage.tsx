import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { PetalMark } from "@/components/branding/PetalMark";
import { ArchDivider } from "@/components/branding/ArchDivider";
import { useAdminI18n } from "../i18n";
import { useAdminSession } from "../auth";
import { ApiError } from "../api";
import { Button } from "../components/Button";
import { Field, Input } from "../components/Field";

export function LoginPage() {
  const { t, locale, setLocale } = useAdminI18n();
  const { user, loading, login } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? (err.status === 401 ? t.invalidCredentials : err.message) : t.networkError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-root flex min-h-dvh items-center justify-center bg-forest px-4 py-16 text-cream">
      <form onSubmit={(e) => void onSubmit(e)} className="w-full max-w-md bg-cream p-8 text-forest">
        <div className="flex items-center justify-between">
          <PetalMark className="size-12 text-forest" />
          <button type="button" className="text-xs tracking-[0.2em] uppercase text-forest/50" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}>
            {locale === "ar" ? "EN" : "ع"}
          </button>
        </div>
        <p className="mt-6 font-[family-name:var(--font-latin)] text-[0.7rem] tracking-[0.32em] uppercase text-terracotta">
          {t.product}
        </p>
        <h1 className="font-copy mt-2 text-3xl">{t.signIn}</h1>
        <ArchDivider className="mt-4 text-terracotta" />
        <p className="mt-4 text-sm text-forest/60">{t.signInHint}</p>
        <div className="mt-8 space-y-5">
          <Field label={t.email}>
            <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label={t.password}>
            <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
        </div>
        {error ? <p className="mt-4 text-sm text-terracotta">{error}</p> : null}
        <Button variant="primary" className="mt-8 w-full" disabled={busy} type="submit">
          {busy ? t.saving : t.signIn}
        </Button>
      </form>
    </div>
  );
}
