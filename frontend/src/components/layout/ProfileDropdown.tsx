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
  UserCircle,
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
      label: "My Hub",
      icon: LayoutDashboard,
      href: "/dashboard",
      show: true,
    },
    {
      label: "Unified Portal",
      icon: LayoutDashboard,
      href: "/portal",
      show: user?.role === "admin" || user?.role === "event_manager",
    },
    {
      label: "My Tickets",
      icon: Ticket,
      href: "/my-tickets",
      show: true,
    },
    {
      label: "Account Settings",
      icon: Settings,
      href: "/settings",
      show: true,
    },
  ].filter((item) => item.show);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted/50 transition-all border border-transparent hover:border-border group"
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
          {user?.name?.charAt(0) || <User className="h-4 w-4" />}
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-xs font-black leading-tight group-hover:text-primary transition-colors">
            {user?.name}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium capitalize">
            {user?.role?.replace("_", " ")}
          </p>
        </div>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-64 bg-white rounded-none shadow-2xl border-2 border-[var(--mnkhan-charcoal)] overflow-hidden z-[100]"
          >
            <div className="p-4 bg-[var(--mnkhan-gray-bg)] border-b-2 border-[var(--mnkhan-charcoal)]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-none bg-[var(--mnkhan-charcoal)] text-white flex items-center justify-center font-black">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tighter">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-[var(--mnkhan-text-muted)] font-bold truncate max-w-[140px] uppercase tracking-widest">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-none text-[11px] font-black uppercase tracking-widest text-[var(--mnkhan-text-muted)] hover:text-white hover:bg-[var(--mnkhan-charcoal)] transition-all group"
                >
                  <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="p-2 border-t mt-1 bg-muted/10">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/5 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
