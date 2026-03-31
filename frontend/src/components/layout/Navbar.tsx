import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import PulseLogo from "./PulseLogo";
import { ThemeToggle } from "./ThemeToggle";

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
    { href: "/local-stores", label: "Store" },
    { href: "/about", label: "About" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Theme-aware glassmorphism
  const navBg =
    isHome && !isScrolled
      ? "bg-transparent border-transparent"
      : "bg-background border-border shadow-xl backdrop-blur-3xl";

  const textColor = "text-foreground";
  const mutedColor = "text-foreground/60";

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-700 ease-[0.16, 1, 0.3, 1] ${navBg}`}
    >
      <nav className="container flex h-16 md:h-20 items-center justify-between">
        {/* Logo - Fixed Width for Centering */}
        <div className="w-48">
          <Link to="/" className="flex items-center gap-4 group w-fit">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.8, ease: "anticipate" }}
            >
              <PulseLogo size={24} />
            </motion.div>
            <span
              className={`text-2xl font-black tracking-tighter uppercase brand-font italic transition-colors duration-300 ${textColor}`}
            >
              City <span className="text-pulse-emerald">Pulse</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center gap-1 bg-muted/40 border border-border/30 p-1 rounded-full">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-300 ${
                  isActive(link.href)
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : `${mutedColor} hover:text-foreground hover:bg-foreground/5`
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Actions - Flexible Width */}
        <div className="hidden md:flex items-center justify-end gap-5 min-w-[12rem] flex-shrink-0">
          <ThemeToggle />

          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-6 rounded-xl shadow-lg border-none transition-all duration-300 hover:scale-105 active:scale-95 group"
                >
                  Join Pulse
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-3xl overflow-hidden"
          >
            <div className="container py-12 space-y-10 h-full flex flex-col">
              <div className="flex justify-between items-center px-8 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Appearance
                </span>
                <ThemeToggle />
              </div>
              <div className="space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-8 py-6 text-2xl font-black uppercase tracking-widest border-l-4 transition-all duration-500 ${
                      isActive(link.href)
                        ? "border-pulse-emerald text-pulse-emerald bg-pulse-emerald/5"
                        : "border-transparent text-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-10 border-t border-border mt-auto pb-20 space-y-6">
                {isAuthenticated ? (
                  <div className="px-8">
                    <ProfileDropdown />
                  </div>
                ) : (
                  <div className="px-8">
                    <Link
                      to="/auth"
                      onClick={() => setIsOpen(false)}
                      className="block w-full"
                    >
                      <Button className="w-full h-16 bg-foreground text-background text-xs font-black uppercase tracking-[0.3em] rounded-2xl border-none hover:bg-pulse-emerald transition-colors">
                        Pulse In
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
