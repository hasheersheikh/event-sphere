import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, MapPin, ChevronDown, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalStoreCart } from "@/contexts/LocalStoreCartContext";
import { useCity } from "@/contexts/CityContext";
import ProfileDropdown from "./ProfileDropdown";
import PulseLogo from "./PulseLogo";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { totalItems, setIsOpen: openCart } = useLocalStoreCart();
  const { selectedCity, setShowCityModal } = useCity();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: "/events", label: "Events" },
    { href: "/local-stores", label: "Stores" },
    { href: "/blog", label: "Blogs" },
    { href: "/about", label: "About" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border shadow-sm py-2"
          : "bg-transparent border-transparent py-4 text-foreground"
      )}
    >
      <nav className="container max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-2 md:gap-4">
        {/* ── Left: Brand & Location ── */}
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <PulseLogo size={18} />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter uppercase italic hidden sm:block">
              City <span className="text-primary">Pulse</span>
            </span>
          </Link>

          {/* Location Selector (Dynamic & Clickable) */}
          <div
            className="flex items-center h-8 border-l border-border/50 pl-2 md:pl-3 ml-0.5 md:ml-1 group cursor-pointer"
            onClick={() => setShowCityModal(true)}
          >
            <div className="flex items-center gap-1.5 md:gap-2.5">
              <div className="bg-primary/10 p-1 md:p-1.5 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <MapPin className="h-3 md:h-3.5 w-3 md:w-3.5" />
              </div>
              <div className="flex flex-col -space-y-0.5">
                <div className="flex items-center gap-0.5 md:gap-1">
                  <span className="text-[10px] md:text-[11px] font-black tracking-tight leading-tight group-hover:text-primary transition-colors max-w-[70px] md:max-w-none truncate">
                    {selectedCity || "Select Location"}
                  </span>
                  <ChevronDown className="h-2.5 md:h-3 w-2.5 md:w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[8px] md:text-[9px] text-muted-foreground font-bold leading-tight hidden xs:block">
                  {selectedCity ? "India" : "Set City"}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-full border border-border/20">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] rounded-full transition-all duration-200",
                    isActive(link.href)
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* ── Center: Categories (Desktop Only) ── */}


        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            <button
              onClick={() => openCart(true)}
              className="relative h-8 w-8 md:h-9 md:w-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Toggle cart"
            >
              <ShoppingCart className="h-3.5 md:h-4 w-3.5 md:w-4 text-muted-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 md:h-4 w-3.5 md:w-4 rounded-full bg-primary text-primary-foreground text-[7px] md:text-[8px] font-black flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <Link to="/auth" className="hidden xs:block">
                <Button
                  size="sm"
                  className="rounded-full bg-primary text-primary-foreground font-black uppercase tracking-widest text-[8px] md:text-[9px] px-3 md:px-5 h-8 md:h-9"
                >
                  Join Pulse
                </Button>
              </Link>
            )}

            {/* Mobile Hamburger Icon */}
            <button
              className="lg:hidden h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-2xl z-40"
          >
            <div className="flex flex-col p-4 space-y-1">
              {/* Mobile Location Selector (Dynamic) */}
              <div
                className="flex items-center gap-3 px-4 py-4 mb-2 bg-muted/30 rounded-2xl border border-border/50 cursor-pointer active:bg-muted transition-colors"
                onClick={() => {
                  setShowCityModal(true);
                  setIsOpen(false);
                }}
              >
                <div className="bg-primary/20 p-2 rounded-full text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-tight">
                    {selectedCity || "Select Location"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold">
                    {selectedCity ? "India" : "Tap to set city"}
                  </span>
                </div>
              </div>

              {/* Account Section for Mobile */}
              {isAuthenticated && (
                <div className="py-2 border-b border-border/50 mb-2">
                  <p className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">My Account</p>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-foreground hover:bg-muted transition-all"
                  >
                    <Settings className="h-4 w-4 text-primary" />
                    Settings
                  </Link>
                </div>
              )}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 mt-2 border-t border-border space-y-3">
                <div className="flex items-center justify-between px-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Appearance</span>
                  <ThemeToggle />
                </div>

                {!isAuthenticated ? (
                  <Link to="/auth" className="block xs:hidden mt-2">
                    <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs">
                      Join Pulse
                    </Button>
                  </Link>
                ) : (
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-red-100 mt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                )}

                <button
                  onClick={() => {
                    openCart(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                  </div>
                  {totalItems > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
