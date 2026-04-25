import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, MapPin, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalStoreCart } from "@/contexts/LocalStoreCartContext";
import { useCity } from "@/contexts/CityContext";
import ProfileDropdown from "./ProfileDropdown";
import PulseLogo from "./PulseLogo";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { totalItems, setIsOpen: openCart } = useLocalStoreCart();
  const { selectedCity, setShowCityModal } = useCity();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: "/events", label: "Events" },
    { href: "/local-stores", label: "Stores" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const navBg = isScrolled
    ? "bg-background/97 border-border/40 backdrop-blur-xl shadow-sm"
    : "bg-background/25 border-border/10 backdrop-blur-md";

  return (
    <header className={`fixed top-0 z-50 w-full border-b transition-all duration-500 ${navBg}`}>
      <nav className="container flex h-14 md:h-16 items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6, ease: "anticipate" }}
          >
            <PulseLogo size={20} />
          </motion.div>
          <span className="font-display text-xl font-black tracking-tighter uppercase">
            City <span className="text-primary">Pulse</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 rounded-lg ${
                isActive(link.href)
                  ? "text-primary"
                  : "text-foreground/50 hover:text-foreground"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-x-2 -bottom-px h-px bg-primary rounded-full"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* City selector */}
          <button
            onClick={() => setShowCityModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground"
          >
            <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
            {selectedCity || "City"}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          <ThemeToggle />

          {/* Cart */}
          <button
            type="button"
            onClick={() => openCart(true)}
            className="relative h-9 w-9 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <ShoppingCart className="h-4 w-4 text-foreground/60" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 min-w-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <Link to="/auth">
              <Button
                size="sm"
                className="h-9 px-5 bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest rounded-lg border-none"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile right actions */}
        <div className="flex md:hidden items-center gap-2">
          {totalItems > 0 && (
            <button
              type="button"
              onClick={() => openCart(true)}
              className="relative h-9 w-9 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center"
            >
              <ShoppingCart className="h-4 w-4 text-foreground/60" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[8px] font-black flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            </button>
          )}
          <button
            className="h-9 w-9 flex items-center justify-center rounded-lg text-foreground/70 hover:text-foreground transition-colors"
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

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-xl"
          >
            <div className="container py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                    isActive(link.href)
                      ? "text-primary bg-primary/8"
                      : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              ))}

              <div className="pt-3 mt-3 border-t border-border/30 flex items-center justify-between gap-3 px-2">
                <button
                  onClick={() => setShowCityModal(true)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-foreground/50 hover:text-primary transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedCity || "Select City"}
                </button>
                <ThemeToggle />
              </div>

              <div className="pt-2 px-2">
                {isAuthenticated ? (
                  <div className="flex justify-start">
                    <ProfileDropdown />
                  </div>
                ) : (
                  <Link to="/auth" className="block">
                    <Button className="w-full h-11 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-xl border-none">
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
