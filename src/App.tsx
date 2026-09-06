import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { lazy, Suspense } from "react";
import { I18nProvider } from "@/lib/i18n";
import { readStoredLocale } from "@/lib/locale";
import { MenuPage } from "@/pages/MenuPage";

const AdminApp = lazy(() => import("@/admin/AdminApp"));

function LocaleGate() {
  const { locale } = useParams();
  if (locale !== "ar" && locale !== "en") {
    return <Navigate to={`/${readStoredLocale()}`} replace />;
  }
  return (
    <I18nProvider>
      <MenuPage />
    </I18nProvider>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${readStoredLocale()}`} replace />} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="min-h-dvh bg-cream" />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="/:locale" element={<LocaleGate />} />
      <Route path="*" element={<Navigate to={`/${readStoredLocale()}`} replace />} />
    </Routes>
  );
}
