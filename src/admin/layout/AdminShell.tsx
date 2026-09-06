import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { PetalMark } from "@/components/branding/PetalMark";
import { useAdminI18n } from "../i18n";
import { useAdminSession } from "../auth";
import { Button } from "../components/Button";

const links = [
  { to: "/admin", end: true, key: "overview" as const },
  { to: "/admin/menu", end: false, key: "menu" as const },
  { to: "/admin/categories", end: false, key: "categories" as const },
  { to: "/admin/settings", end: false, key: "settings" as const },
  { to: "/admin/preview", end: false, key: "preview" as const },
];

export function AdminShell() {
  const { t, locale, setLocale } = useAdminI18n();
  const { user, logout } = useAdminSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function onLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-root min-h-dvh bg-cream text-forest" data-locale={locale}>
      <header className="sticky top-0 z-40 border-b border-cream/10 bg-forest text-cream">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <PetalMark className="size-8 shrink-0 text-cream" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-[family-name:var(--font-latin)] text-[0.65rem] tracking-[0.28em] uppercase text-cream/60">
              {t.product}
            </p>
            <p className="truncate font-copy text-sm">{t.brand}</p>
          </div>
          <button
            type="button"
            className="min-h-11 px-2 text-xs tracking-[0.2em] uppercase md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {t.menu}
          </button>
          <button
            type="button"
            className="hidden min-h-11 px-2 text-xs tracking-[0.18em] uppercase text-cream/80 sm:inline"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          >
            {locale === "ar" ? "EN" : "ع"}
          </button>
          <Button variant="ghost" className="hidden border-cream/20 text-cream sm:inline-flex" onClick={() => void onLogout()}>
            {t.logout}
          </Button>
        </div>
        <nav className={`${open ? "block" : "hidden"} border-t border-cream/10 md:block`}>
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-2 py-2 md:flex-row md:items-center md:gap-0">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `min-h-11 px-3 py-2 text-sm tracking-[0.14em] uppercase ${
                    isActive ? "text-cream" : "text-cream/55 hover:text-cream"
                  }`
                }
              >
                {t[link.key]}
              </NavLink>
            ))}
            <div className="flex items-center gap-2 px-2 py-2 md:ms-auto">
              <button
                type="button"
                className="min-h-11 px-2 text-xs tracking-[0.18em] uppercase sm:hidden"
                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              >
                {locale === "ar" ? "EN" : "ع"}
              </button>
              <span className="hidden text-xs text-cream/45 md:inline">{user?.email}</span>
              <Button variant="ghost" className="border-cream/20 text-cream sm:hidden" onClick={() => void onLogout()}>
                {t.logout}
              </Button>
            </div>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
