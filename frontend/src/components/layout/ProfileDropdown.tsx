import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  User,
  LogOut,
  LayoutDashboard,
  Ticket,
  Settings,
  ChevronDown,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      label: "Pulse Portal",
      icon: LayoutDashboard,
      href: "/portal",
      show: user?.role === "admin" || user?.role === "event_manager",
    },
    {
      label: "My Collections",
      icon: Ticket,
      href: "/my-tickets",
      show: true,
    },
    {
      label: "Auth Settings",
      icon: Settings,
      href: "/settings",
      show: true,
    },
  ].filter((item) => item.show);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 p-1.5 pr-5 rounded-2xl glass-panel bg-muted border border-border hover:border-pulse-emerald/50 transition-all duration-500 group shadow-lg"
      >
        <div className="h-10 w-10 rounded-xl bg-pulse-emerald flex items-center justify-center text-background font-black overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          {user?.name?.charAt(0) || <User className="h-5 w-5" />}
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground leading-tight group-hover:text-pulse-emerald transition-colors">
            {user?.name}
          </p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest italic">
            {user?.role?.replace("_", " ")}
          </p>
        </div>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-500 ${isOpen ? "rotate-180 text-pulse-emerald" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-4 w-72 glass-panel bg-background border border-border backdrop-blur-md rounded-3xl overflow-hidden z-[100] shadow-[0_30px_100px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="p-6 border-b border-border bg-muted">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-pulse-emerald text-background flex items-center justify-center font-black text-xl shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-xs uppercase tracking-[0.2em] text-foreground italic">
                    {user?.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-bold truncate max-w-[160px] uppercase tracking-[0.2em]">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-pulse-emerald/10 transition-all duration-300 group"
                >
                  <item.icon className="h-4.5 w-4.5 transition-all group-hover:scale-110 group-hover:text-pulse-emerald" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="p-3 pt-2 pb-5 border-t border-border mt-1">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 hover:text-foreground hover:bg-rose-500/10 transition-all duration-500 group"
              >
                <LogOut className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                De-sync Pulse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
