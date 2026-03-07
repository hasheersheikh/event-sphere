import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Menu, X, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PortalLayoutProps {
  children: ReactNode;
}

const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user || user.role === "user") {
    return <Navigate to="/dashboard" replace />;
  }

  if (location.pathname === "/portal" || location.pathname === "/portal/") {
    return (
      <Navigate
        to={user.role === "admin" ? "/portal/admin" : "/portal/manager"}
        replace
      />
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 z-50 lg:hidden"
            >
              <Sidebar />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-8 right-[-50px] p-3 bg-card border border-border text-foreground rounded-r-xl"
              >
                <X className="h-6 w-6" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-80 min-h-screen transition-all duration-300">
        {/* Top Header */}
        <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-foreground/5 rounded-lg transition-colors text-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-muted border border-border px-4 py-2 rounded-xl group focus-within:border-emerald-500/50 transition-all">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-emerald-400" />
              <input
                type="text"
                placeholder="Search control..."
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-64 text-foreground placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted border border-border hover:bg-accent transition-all relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </button>

            <div className="h-8 w-[1px] bg-border mx-2" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black uppercase tracking-tighter text-foreground">
                  {user?.name}
                </p>
                <p className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
              <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 md:p-12 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
