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
      <div className="h-screen w-full flex items-center justify-center bg-[var(--mnkhan-gray-bg)]">
        <div className="h-12 w-12 border-4 border-[var(--mnkhan-orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--mnkhan-gray-bg)] flex overflow-x-hidden">
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
                className="absolute top-8 right-[-50px] p-3 bg-[var(--mnkhan-charcoal)] text-white"
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
        <header className="h-20 bg-white border-b border-[var(--mnkhan-gray-border)] flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-[var(--mnkhan-gray-bg)] border px-4 py-2 rounded-none group focus-within:border-[var(--mnkhan-orange)] transition-colors">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-[var(--mnkhan-orange)]" />
              <input
                type="text"
                placeholder="Search entries..."
                className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="h-10 w-10 flex items-center justify-center rounded-none hover:bg-muted transition-colors relative">
              <Bell className="h-5 w-5 text-[var(--mnkhan-charcoal)]" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-[var(--mnkhan-orange)]" />
            </button>
            <div className="h-10 w-[1px] bg-border mx-2" />
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black brand-font uppercase tracking-tighter">
                {user?.name}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
            <div className="h-10 w-10 bg-[var(--mnkhan-charcoal)] flex items-center justify-center font-black text-white text-xs">
              {user?.name?.charAt(0)}
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
