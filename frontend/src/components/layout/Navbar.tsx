import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Calendar, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/events", label: "Events" },
    { href: "/categories", label: "Lineup" },
    { href: "/about", label: "About" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const navBg =
    isHome && !isScrolled
      ? "bg-transparent border-transparent"
      : "bg-background/95 backdrop-blur-md border-border/50 supports-[backdrop-filter]:bg-background/80 shadow-sm";

  // White text on home hero, Charcoal (primary text) elsewhere
  const textColor =
    isHome && !isScrolled ? "text-white" : "text-[var(--mnkhan-charcoal)]";
  const mutedColor =
    isHome && !isScrolled ? "text-white/80" : "text-[var(--mnkhan-text-muted)]";

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-500 ease-in-out ${navBg}`}
    >
      <nav className="container flex h-16 md:h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center bg-[var(--mnkhan-orange)] group-hover:bg-[var(--mnkhan-orange-hover)] transition-colors shadow-lg shadow-orange-500/20">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <span
            className={`text-xl font-black tracking-tighter brand-font uppercase transition-colors duration-300 ${textColor}`}
          >
            City Pulse
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-5 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                isActive(link.href)
                  ? "text-[var(--mnkhan-orange)]"
                  : `${mutedColor} hover:${textColor} hover:opacity-100`
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full transition-colors ${mutedColor} hover:bg-muted/30`}
          >
            <Search className="h-5 w-5" />
          </Button>

          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button
                  size="sm"
                  className="bg-[var(--mnkhan-orange)] hover:bg-[var(--mnkhan-orange-hover)] text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 rounded-none shadow-button border-none"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 transition-colors ${textColor}`}
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-border bg-background/98 backdrop-blur-xl shadow-2xl"
          >
            <div className="container py-8 space-y-6">
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-6 py-4 text-sm font-black uppercase tracking-widest border-l-4 transition-all ${
                      isActive(link.href)
                        ? "border-[var(--mnkhan-orange)] text-[var(--mnkhan-orange)] bg-orange-500/5 transition-all"
                        : "border-transparent text-[var(--mnkhan-text-muted)] hover:text-[var(--mnkhan-charcoal)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                {isAuthenticated ? (
                  <div className="px-6 pb-4">
                    <ProfileDropdown />
                  </div>
                ) : (
                  <div className="px-6 space-y-3">
                    <Link
                      to="/auth"
                      onClick={() => setIsOpen(false)}
                      className="block w-full"
                    >
                      <Button className="w-full bg-[var(--mnkhan-orange)] text-white text-xs font-black uppercase tracking-widest py-6 border-none">
                        Member Sign In
                      </Button>
                    </Link>
                  </div>
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
