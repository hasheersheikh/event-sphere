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
  Store,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PulseLogo from "./PulseLogo";

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
    { label: "Event Moderation", icon: Calendar, href: "/portal/admin/events" },
    { label: "Stores", icon: Store, href: "/portal/admin/local-stores" },
    { label: "Store Orders", icon: CheckCircle, href: "/portal/admin/store-orders" },
    { label: "Sales Analytics", icon: TrendingUp, href: "/portal/analytics" },
    { label: "Scanner Hub", icon: Scan, href: "/scanner" },
    { label: "Platform Settings", icon: Settings, href: "/portal/settings" },
  ];

  const managerLinks = [
    { label: "Manager Hub", icon: LayoutDashboard, href: "/portal/manager" },
    { label: "My Events", icon: Calendar, href: "/portal/events" },
    {
      label: "Payout History",
      icon: TrendingUp,
      href: "/portal/manager/payouts",
    },
    {
      label: "Sales Analytics",
      icon: TrendingUp,
      href: "/portal/manager/analytics",
    },
    { label: "Scanner Hub", icon: Scan, href: "/scanner" },
    { label: "Profile Settings", icon: Settings, href: "/portal/settings" },
  ];

  const links = user?.role === "admin" ? adminLinks : managerLinks;

  return (
    <aside className="w-72 h-screen bg-card text-card-foreground border-r border-border flex flex-col fixed left-0 top-0 z-40">
      {/* Brand */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-3 group">
          <PulseLogo className="h-9 w-9" />
          <span className="text-xl font-black tracking-tighter brand-font uppercase">
            City Pulse
          </span>
        </Link>
      </div>

      {/* User Status */}
      <div className="px-6 py-6 bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center font-black text-lg bg-muted">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-black truncate max-w-[140px]">
              {user?.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={`h-2 w-2 rounded-full ${user?.role === "admin" ? "bg-primary" : "bg-primary/60"}`}
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30" />
          <input
            type="text"
            placeholder="Search command..."
            className="w-full bg-muted/50 border border-border rounded-none py-2.5 pl-9 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-colors text-foreground"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 mt-2 italic">
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
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <link.icon
                className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`}
              />
              <span className="text-[11px] font-black uppercase tracking-widest">
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Security Status
          </p>
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-muted-foreground/60">
              Secure Endpoints Verified
            </span>
          </div>
          {/* <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-orange-400" />
            <span className="text-[10px] font-bold text-muted-foreground/60">
              Session: 2h remaining
            </span>
          </div> */}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
