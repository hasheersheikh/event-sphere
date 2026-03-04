import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Calendar,
  Search,
  User,
  Plus,
  LogOut,
  LayoutDashboard,
  Ticket,
  ScanLine,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/events", label: "Events" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const navBg =
    isHome && !isScrolled
      ? "bg-transparent border-transparent"
      : "bg-background/95 backdrop-blur border-border/50 supports-[backdrop-filter]:bg-background/60";

  const textColor = isHome && !isScrolled ? "text-white" : "text-foreground";
  const mutedColor =
    isHome && !isScrolled ? "text-white/70" : "text-muted-foreground";

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${navBg}`}
    >
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <span
            className={`text-lg font-extrabold uppercase tracking-wider ${textColor}`}
          >
            City Pulse
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? "bg-primary/10 text-primary"
                  : `${mutedColor} hover:${textColor} hover:bg-white/10`
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${mutedColor}`}
          >
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />

          {(user?.role === "event_manager" || user?.role === "admin") && (
            <Link to="/scanner">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${mutedColor}`}
              >
                <ScanLine className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {(user?.role === "event_manager" || user?.role === "admin") && (
            <Link to="/events/create">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
              >
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 rounded-full ${mutedColor}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/my-tickets">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 rounded-full ${mutedColor}`}
                >
                  <Ticket className="h-4 w-4" />
                  Tickets
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className={`rounded-full ${mutedColor}`}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button
                size="sm"
                className="gap-2 rounded-full shadow-button font-bold"
              >
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 rounded-full hover:bg-white/10 transition-colors ${textColor}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                <ThemeToggle />

                {(user?.role === "event_manager" || user?.role === "admin") && (
                  <Link to="/events/create" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full gap-2 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                )}

                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full gap-2 rounded-full"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/my-tickets" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full gap-2 rounded-full"
                      >
                        <Ticket className="h-4 w-4" />
                        My Tickets
                      </Button>
                    </Link>
                    {(user?.role === "event_manager" ||
                      user?.role === "admin") && (
                      <Link to="/scanner" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 rounded-full"
                        >
                          <ScanLine className="h-5 w-5" />
                          Scanner
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full gap-2 text-muted-foreground rounded-full"
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button className="w-full gap-2 shadow-button rounded-full">
                      <User className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
