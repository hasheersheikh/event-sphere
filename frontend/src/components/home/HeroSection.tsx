import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

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
        <img
          src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=2000"
          alt="Live event atmosphere"
          className="w-full h-full object-cover"
        />
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
