import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AdminI18nProvider } from "./i18n";
import { AdminAuthProvider, useAdminSession } from "./auth";
import { AdminShell } from "./layout/AdminShell";
import { LoginPage } from "./pages/LoginPage";

const OverviewPage = lazy(() => import("./pages/OverviewPage").then((m) => ({ default: m.OverviewPage })));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage").then((m) => ({ default: m.CategoriesPage })));
const CategoryEditorPage = lazy(() => import("./pages/CategoryEditorPage").then((m) => ({ default: m.CategoryEditorPage })));
const MenuListPage = lazy(() => import("./pages/MenuListPage").then((m) => ({ default: m.MenuListPage })));
const ItemEditorPage = lazy(() => import("./pages/ItemEditorPage").then((m) => ({ default: m.ItemEditorPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const PreviewPage = lazy(() => import("./pages/PreviewPage").then((m) => ({ default: m.PreviewPage })));

function Guard() {
  const { user, loading } = useAdminSession();
  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center bg-cream text-forest/50">…</div>;
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<Guard />}>
        <Route element={<AdminShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/new" element={<CategoryEditorPage />} />
          <Route path="categories/:id" element={<CategoryEditorPage />} />
          <Route path="menu" element={<MenuListPage />} />
          <Route path="menu/new" element={<ItemEditorPage />} />
          <Route path="menu/:id/edit" element={<ItemEditorPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="preview" element={<PreviewPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AdminI18nProvider>
      <AdminAuthProvider>
        <Suspense fallback={<div className="min-h-dvh bg-cream" />}>
          <AdminRoutes />
        </Suspense>
      </AdminAuthProvider>
    </AdminI18nProvider>
  );
}
