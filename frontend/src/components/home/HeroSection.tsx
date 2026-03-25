import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LIGHT_IMAGES = [
  "https://images.unsplash.com/photo-1533174000228-2a11b65e1017?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=2000",
];

const DARK_IMAGES = [
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1470229722913-7c092bce52f3?auto=format&fit=crop&q=80&w=2000",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=2000",
];

const HeroSection = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentImages = resolvedTheme === "dark" ? DARK_IMAGES : LIGHT_IMAGES;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (location) params.set("location", location);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImages[currentImageIndex]}
            src={currentImages[currentImageIndex]}
            alt="Live event atmosphere"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/70" />
      </div>

      {/* Content */}
      <div className="container relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground tracking-tight mb-8 leading-[0.95]">
            The Pulse
            <br />
            <span className="text-foreground/80">of Your City.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium">
            Discover concerts, workshops, and experiences happening around you.
          </p>

          {/* Search Box */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearch}
            className="bg-white rounded-full p-1.5 shadow-2xl max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-1">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-12 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-gray-400 text-base rounded-full"
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-gray-200" />
              <div className="relative hidden md:block flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 pl-12 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-gray-400 text-base rounded-full"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-11 px-8 rounded-full font-bold shadow-button"
              >
                Search
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
