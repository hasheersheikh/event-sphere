import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, MapPin, ChevronDown, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalStoreCart } from "@/contexts/LocalStoreCartContext";
import { useCity } from "@/contexts/CityContext";
import ProfileDropdown from "./ProfileDropdown";
import PulseLogo from "./PulseLogo";
import { ThemeToggle } from "./ThemeToggle";
import { FEATURES } from "@/config/features";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { totalItems, setIsOpen: openCart } = useLocalStoreCart();
  const { selectedCity, setShowCityModal } = useCity();

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setIsScrolled(y > 20);
        // Hide only when scrolling down past the header; show on scroll up.
        setIsHidden(y > 80 && y > lastY);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: "/events", label: "Events" },
    { href: "/local-stores", label: "Stores" },
    { href: "/boost", label: "Marketing" },
    ...(FEATURES.ENABLE_BLOGS ? [{ href: "/blog", label: "Blog" }] : []),
    { href: "/list-your-event", label: "List Your Event" },
    { href: "/about", label: "About" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const navBg = isScrolled
    ? "bg-background/95 backdrop-blur-xl border-border/40 shadow-sm"
    : "bg-background border-transparent";

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${navBg} ${
        isHidden && !isOpen
          ? "-translate-y-full"
          : "translate-y-0"
      }`}
    >
      <nav className={`container flex items-center justify-between gap-4 transition-all duration-300 ${isScrolled ? "h-12 md:h-16" : "h-14 md:h-16"}`}>

        {/* ── Logo ── */}
        <Link
          to="/"
          className={`flex items-center gap-2 shrink-0 group transition-transform duration-300 ${
            isScrolled ? "scale-[0.7] md:scale-100" : "scale-100"
          }`}
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6, ease: "anticipate" }}
          >
            <PulseLogo size={24} />
          </motion.div>
          <span className="font-display text-2xl font-black tracking-tighter uppercase">
            City <span className="opacity-40">Pulse</span>
          </span>
        </Link>

        {/* ── Desktop right section: Location | Nav | Actions ── */}
        <div className="hidden md:flex items-center gap-1">

          {/* Location selector */}
          <button
            onClick={() => setShowCityModal(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg hover:bg-muted/60 transition-colors text-[11px] font-bold uppercase tracking-widest text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white"
          >
            <MapPin className="h-3 w-3 shrink-0" />
            {selectedCity || "City"}
            <ChevronDown className="h-2.5 w-2.5 text-black/50 dark:text-white/50" />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-border/50 mx-1.5" />

          {/* Category nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative h-8 px-3 flex items-center text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-150 rounded-lg ${
                isActive(link.href)
                  ? "text-black dark:text-white"
                  : "text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-2 -bottom-px h-px bg-black dark:bg-white rounded-full"
                />
              )}
            </Link>
          ))}

          {/* Divider */}
          <div className="w-px h-4 bg-border/50 mx-1.5" />

          {/* Theme + Cart */}
          <ThemeToggle />

          <button
            type="button"
            onClick={() => openCart(true)}
            className="relative h-8 w-8 rounded-lg flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-muted/60 transition-all"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-foreground text-background text-[8px] font-black flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          {/* Sign In / Profile */}
          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <Link to="/auth" className="ml-1">
              <Button
                variant="default"
                size="sm"
                className="h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg"
              >
                Login / Signup
              </Button>
            </Link>
          )}
        </div>

        {/* ── Mobile right actions ── */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={() => openCart(true)}
            className="relative h-9 w-9 rounded-lg flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 rounded-full bg-foreground text-background text-[8px] font-black flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          <button
            className="h-9 w-9 flex items-center justify-center rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted/60 transition-all"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="md:hidden border-t border-border/30 bg-background/98 backdrop-blur-xl"
          >
            <div className="container py-3 space-y-0.5">
              {/* City */}
              <button
                onClick={() => { setShowCityModal(true); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-muted/40 transition-all text-left"
              >
                <MapPin className="h-4 w-4 shrink-0" />
                {selectedCity || "Select a city"}
                <ChevronDown className="h-3.5 w-3.5 ml-auto text-black/50 dark:text-white/50" />
              </button>

              <div className="h-px bg-border/30 my-1" />

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                    isActive(link.href)
                      ? "text-black dark:text-white bg-black/10 dark:bg-white/10"
                      : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-muted/40"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
                  )}
                </Link>
              ))}

              <div className="h-px bg-border/30 my-1" />

              <div className="flex items-center justify-between px-2 py-2">
                <ThemeToggle />
                {isAuthenticated ? (
                  <ProfileDropdown />
                ) : (
                  <Link to="/auth">
                    <Button variant="default" className="h-9 px-5 font-black uppercase tracking-widest text-[10px] rounded-xl">
                      Login / Signup
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
