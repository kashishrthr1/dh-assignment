import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Public Pages
import { PublicLayout } from "./pages/public/PublicLayout";
import { HomePage } from "./pages/public/HomePage";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";
import { CharitiesPage } from "./pages/public/CharitiesPage";
import { CharityDetailPage } from "./pages/public/CharityDetailPage";
import { DonatePage } from "./pages/public/DonatePage";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";

// Member Dashboard Pages
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { DashboardOverviewPage } from "./pages/dashboard/DashboardOverviewPage";
import { ScoresPage } from "./pages/dashboard/ScoresPage";
import { DrawsPage } from "./pages/dashboard/DrawsPage";
import { CharityPage } from "./pages/dashboard/CharityPage";
import { WinningsPage } from "./pages/dashboard/WinningsPage";
import { SettingsPage } from "./pages/dashboard/SettingsPage";
import { ReactivatePage } from "./pages/dashboard/ReactivatePage";

// Admin Portal Pages
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminOverviewPage } from "./pages/admin/AdminOverviewPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminDrawsPage } from "./pages/admin/AdminDrawsPage";
import { AdminCharitiesPage } from "./pages/admin/AdminCharitiesPage";
import { AdminWinnersPage } from "./pages/admin/AdminWinnersPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";

// Route Guards
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-emerald border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-emerald border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/charities" element={<CharitiesPage />} />
            <Route path="/charities/:slug" element={<CharityDetailPage />} />
            <Route path="/donate" element={<DonatePage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Subscriber Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverviewPage />} />
            <Route path="scores" element={<ScoresPage />} />
            <Route path="draws" element={<DrawsPage />} />
            <Route path="charity" element={<CharityPage />} />
            <Route path="winnings" element={<WinningsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="reactivate" element={<ReactivatePage />} />
          </Route>

          {/* Admin Control Surfaces */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="draws" element={<AdminDrawsPage />} />
            <Route path="charities" element={<AdminCharitiesPage />} />
            <Route path="winners" element={<AdminWinnersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
