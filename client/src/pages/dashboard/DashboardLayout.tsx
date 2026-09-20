import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/ui/Badge";
import {
  Trophy,
  LayoutDashboard,
  Target,
  Gift,
  Heart,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Overview", to: "/dashboard", icon: LayoutDashboard, end: true },
    { label: "My 5 Scores", to: "/dashboard/scores", icon: Target },
    { label: "Monthly Draws", to: "/dashboard/draws", icon: Gift },
    { label: "Charity Impact", to: "/dashboard/charity", icon: Heart },
    { label: "Winnings", to: "/dashboard/winnings", icon: Award },
    { label: "Settings & Billing", to: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface-base flex text-text-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-card border-r border-surface-border p-6 justify-between shrink-0">
        <div className="space-y-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-emerald to-emerald-700 flex items-center justify-center shadow-neon">
              <Trophy className="w-5 h-5 text-surface-base" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-white">
              DIGITAL<span className="text-primary-emerald">HEROES</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-emerald/10 text-primary-emerald border border-primary-emerald/30 shadow-neon"
                        : "text-text-muted hover:text-white hover:bg-surface-elevated"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}

            {user?.role === "admin" && (
              <div className="pt-4 border-t border-surface-border/50">
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin Portal
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-surface-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-elevated border border-surface-border flex items-center justify-center font-bold text-primary-emerald">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <div className="font-medium text-sm text-white truncate">
                {user?.fullName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant={
                    user?.subscriptionStatus === "active" ? "emerald" : "rose"
                  }
                >
                  {user?.subscriptionStatus?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface-card border-b border-surface-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-emerald to-emerald-700 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-surface-base" />
            </div>
            <span className="font-display font-bold text-white">DIGITALHEROES</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text-muted hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-card border-b border-surface-border p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                      isActive
                        ? "bg-primary-emerald/10 text-primary-emerald"
                        : "text-text-muted"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-amber-400 bg-amber-500/10"
              >
                <ShieldAlert className="w-4 h-4" /> Admin Portal
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 mt-2 border-t border-surface-border pt-3"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
