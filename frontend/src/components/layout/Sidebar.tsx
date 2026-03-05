import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Calendar,
  TrendingUp,
  Settings,
  ShieldCheck,
  LayoutDashboard,
  Search,
  CheckCircle,
  Clock,
  Scan,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const adminLinks = [
    {
      label: "Executive Overview",
      icon: LayoutDashboard,
      href: "/portal/admin",
    },
    { label: "Attendees", icon: Users, href: "/portal/admin/attendees" },
    { label: "Managers", icon: ShieldCheck, href: "/portal/admin/managers" },
    { label: "Event Moderation", icon: Calendar, href: "/portal/events" },
    { label: "Sales Analytics", icon: TrendingUp, href: "/portal/analytics" },
    { label: "Scanner Hub", icon: Scan, href: "/scanner" },
    { label: "Platform Settings", icon: Settings, href: "/portal/settings" },
  ];

  const managerLinks = [
    { label: "Manager Hub", icon: LayoutDashboard, href: "/portal/manager" },
    { label: "My Productions", icon: Calendar, href: "/portal/productions" },
    { label: "Sales Analytics", icon: TrendingUp, href: "/portal/analytics" },
    { label: "Scanner Hub", icon: Scan, href: "/scanner" },
    { label: "Profile Settings", icon: Settings, href: "/portal/settings" },
  ];

  const links = user?.role === "admin" ? adminLinks : managerLinks;

  return (
    <aside className="w-80 h-screen bg-[var(--mnkhan-charcoal)] text-white border-r border-white/5 flex flex-col fixed left-0 top-0 z-40">
      {/* Brand */}
      <div className="p-8 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 bg-[var(--mnkhan-orange)] flex items-center justify-center shadow-lg shadow-orange-600/20">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter brand-font uppercase">
            City Pulse
          </span>
        </Link>
      </div>

      {/* User Status */}
      <div className="px-8 py-8 bg-black/20">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-[var(--mnkhan-orange)] flex items-center justify-center font-black text-lg bg-white/5">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-black truncate max-w-[140px]">
              {user?.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={`h-2 w-2 rounded-full ${user?.role === "admin" ? "bg-orange-500" : "bg-emerald-500"}`}
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-8 py-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search command..."
            className="w-full bg-white/5 border border-white/10 rounded-none py-2.5 pl-9 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-[var(--mnkhan-orange)] transition-colors"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 mt-2 italic">
          Main Operations
        </p>
        {links.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-3 px-4 py-3.5 transition-all group ${
                isActive
                  ? "bg-[var(--mnkhan-orange)] text-white shadow-lg shadow-orange-600/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <link.icon
                className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-white/40 group-hover:text-[var(--mnkhan-orange)]"}`}
              />
              <span className="text-[11px] font-black uppercase tracking-widest">
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-8 border-t border-white/5 bg-black/10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            Security Status
          </p>
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-white/60">
              Endpoints Verified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-orange-400" />
            <span className="text-[10px] font-bold text-white/60">
              Session: 2h remaining
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
