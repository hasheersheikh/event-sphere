import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDropdown from "./ProfileDropdown";
import PulseLogo from "./PulseLogo";

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

  // Dark glassmorphism on scroll or non-home, transparent on home top
  const navBg =
    isHome && !isScrolled
      ? "bg-transparent border-transparent"
      : "glass-panel bg-black/40 border-white/10 shadow-2xl backdrop-blur-3xl";

  const textColor = "text-white";
  const mutedColor = "text-white/60";

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-700 ease-[0.16, 1, 0.3, 1] ${navBg}`}
    >
      <nav className="container flex h-16 md:h-24 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 group">
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-3xl border border-white/10 p-1.5 rounded-full">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] rounded-full transition-all duration-500 ${
                isActive(link.href)
                  ? "bg-white text-black shadow-xl"
                  : `${mutedColor} hover:text-white hover:bg-white/5`
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
            className={`rounded-full h-12 w-12 transition-all duration-500 ${mutedColor} hover:bg-white/10 hover:text-pulse-emerald border border-transparent hover:border-white/10`}
          >
            <Search className="h-5 w-5" />
          </Button>

          {isAuthenticated ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-pulse-emerald hover:text-black text-[10px] font-black uppercase tracking-[0.3em] px-10 rounded-full shadow-[0_15px_30px_rgba(255,255,255,0.1)] border-none transition-all duration-500 hover:scale-105 active:scale-95 group"
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
            className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-3xl overflow-hidden"
          >
            <div className="container py-12 space-y-10 h-full flex flex-col">
              <div className="space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-8 py-6 text-2xl font-black uppercase tracking-widest border-l-4 transition-all duration-500 ${
                      isActive(link.href)
                        ? "border-pulse-emerald text-emerald-400 bg-emerald-500/5"
                        : "border-transparent text-white/40 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-10 border-t border-white/10 mt-auto pb-20 space-y-6">
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
                      <Button className="w-full h-16 bg-white text-black text-xs font-black uppercase tracking-[0.3em] rounded-2xl border-none hover:bg-pulse-emerald transition-colors">
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
