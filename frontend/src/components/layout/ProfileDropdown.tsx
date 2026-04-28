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
  ShoppingBag,
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
      label: "Portal",
      icon: LayoutDashboard,
      href: "/portal",
      show: user?.role === "admin" || user?.role === "event_manager",
    },
    {
      label: "Tickets",
      icon: Ticket,
      href: "/my-tickets",
      show: true,
    },
    {
      label: "My Orders",
      icon: ShoppingBag,
      href: "/my-orders",
      show: true,
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      show: true,
    },
  ].filter((item) => item.show);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 pr-3 rounded-xl bg-card border border-border hover:border-primary transition-all duration-500 group"
      >
        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black overflow-hidden">
          {user?.name?.charAt(0) || <User className="h-4 w-4" />}
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground leading-tight group-hover:text-primary transition-colors">
            {user?.name}
          </p>
          <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest italic">
            {user?.role?.replace("_", " ")}
          </p>
        </div>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform duration-500 ${isOpen ? "rotate-180 text-primary" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-xl overflow-hidden z-[100]"
          >
            <div className="p-3 border-b border-border bg-muted">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground italic">
                    {user?.name}
                  </p>
                  <p className="text-[8px] text-muted-foreground font-bold truncate max-w-[120px] uppercase tracking-[0.2em]">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-1.5 space-y-0.5">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 group"
                >
                  <item.icon className="h-3.5 w-3.5 transition-all group-hover:scale-110 group-hover:text-primary" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="p-1.5 pt-1 pb-2 border-t border-border mt-1">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 group"
              >
                <LogOut className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
