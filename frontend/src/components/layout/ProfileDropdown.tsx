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
        className="flex items-center gap-4 p-1.5 pr-5 rounded-2xl glass-panel bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all duration-500 group shadow-lg"
      >
        <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black font-black overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          {user?.name?.charAt(0) || <User className="h-5 w-5" />}
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white leading-tight group-hover:text-emerald-400 transition-colors">
            {user?.name}
          </p>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest italic">
            {user?.role?.replace("_", " ")}
          </p>
        </div>
        <ChevronDown
          className={`h-3 w-3 text-white/40 transition-transform duration-500 ${isOpen ? "rotate-180 text-emerald-400" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-4 w-80 glass-panel bg-zinc-950/95 border border-white/10 backdrop-blur-md rounded-[2.5rem] overflow-hidden z-[100] shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
          >
            <div className="p-8 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black text-xl shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-xs uppercase tracking-[0.2em] text-white italic">
                    {user?.name}
                  </p>
                  <p className="text-[9px] text-white/30 font-bold truncate max-w-[160px] uppercase tracking-[0.2em]">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-emerald-500/10 transition-all duration-300 group"
                >
                  <item.icon className="h-4.5 w-4.5 transition-all group-hover:scale-110 group-hover:text-emerald-400" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="p-4 pt-2 pb-6 border-t border-white/5 mt-2">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 hover:text-white hover:bg-rose-500/10 transition-all duration-500 group"
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
