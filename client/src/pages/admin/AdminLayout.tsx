import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/ui/Badge";
import {
  ShieldAlert,
  Users,
  Dices,
  HeartHandshake,
  CheckSquare,
  BarChart3,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminNav = [
    { label: "Overview", to: "/admin", icon: BarChart3, end: true },
    { label: "User Management & Audits", to: "/admin/users", icon: Users },
    { label: "Draw Engine Console", to: "/admin/draws", icon: Dices },
    { label: "Charities & Spotlights", to: "/admin/charities", icon: HeartHandshake },
    { label: "Winner Verification", to: "/admin/winners", icon: CheckSquare },
    { label: "Financial Reports", to: "/admin/reports", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#080c10] flex text-text-primary">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0d131a] border-r border-[#1a2330] p-6 justify-between shrink-0">
        <div className="space-y-8">
          {/* Admin Header */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-base text-white tracking-wide">
                  ADMIN CONSOLE
                </div>
                <div className="text-[10px] uppercase font-mono text-amber-400">
                  Digital Heroes UK
                </div>
              </div>
            </div>
          </div>

          {/* Admin Nav Links */}
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        : "text-slate-400 hover:text-white hover:bg-[#151e29]"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Back to Member Portal */}
        <div className="pt-6 border-t border-[#1a2330] space-y-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white p-2 rounded-lg hover:bg-[#151e29] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Member Dashboard
          </Link>
          <div className="text-[11px] text-slate-500 font-mono">
            Signed in as: {user?.email}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-[#0d131a] border-b border-[#1a2330]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white text-sm">ADMIN CONSOLE</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 text-slate-400 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="lg:hidden bg-[#0d131a] border-b border-[#1a2330] p-4 space-y-2">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                      isActive ? "bg-amber-500/20 text-amber-300" : "text-slate-400"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-[#1a2330]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Member Dashboard
            </Link>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
