import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, AlertCircle, Search, Building2,
  LocateFixed, Navigation,
} from "lucide-react";
import { CITIES, City, useCity } from "@/contexts/CityContext";

const POPULAR_CITIES: string[] = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune",
  "Nagpur", "Kolkata", "Ahmedabad", "Jaipur", "Surat", "Lucknow",
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CitySelectModal = () => {
  const { showCityModal, setShowCityModal, setSelectedCity, selectedCity } = useCity();
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState("A");
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedCityName, setDetectedCityName] = useState<string | null>(null);

  const handleSelect = (city: City) => {
    setSelectedCity(city);
  };

  const handleSkip = () => {
    setSelectedCity(null);
    localStorage.setItem("citypulse_city_selected", "true");
    setShowCityModal(false);
  };

  const handleLocateMe = () => {
    setIsLocating(true);
    setErrorMsg(null);
    setDetectedCityName(null);

    if (!navigator.geolocation) {
      setErrorMsg("Location access is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { headers: { "User-Agent": "CityPulseEventSphere/1.0" } }
          );
          if (!res.ok) throw new Error("Location lookup failed.");
          const data = await res.json();
          const addr = data.address;
          if (addr) {
            const detected = addr.city || addr.town || addr.village || addr.municipality;
            if (detected) {
              setDetectedCityName(detected);
              const matched = CITIES.find(c => c.toLowerCase() === detected.toLowerCase());
              if (matched) setSelectedCity(matched);
            } else {
              setErrorMsg("Could not identify city name.");
            }
          } else {
            setErrorMsg("No address details found.");
          }
        } catch {
          setErrorMsg("Failed to retrieve city information.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg("Permission to access location was denied.");
        } else {
          setErrorMsg("Unable to retrieve location details.");
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const availableLetters = useMemo(
    () => new Set(CITIES.map(c => c[0].toUpperCase())),
    []
  );

  const filteredCities = useMemo(() => {
    if (search.trim()) {
      return CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase().trim()));
    }
    return CITIES.filter(c => c[0].toUpperCase() === activeLetter);
  }, [search, activeLetter]);

  return (
    <AnimatePresence>
      {showCityModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleSkip()}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="bg-background w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
          >
            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0">
              <h2 className="text-xl font-black tracking-tight">Select Location</h2>
              <button
                onClick={handleSkip}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="px-6 pb-8 overflow-y-auto flex-1 space-y-5">

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search city, area or locality"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-full border border-border bg-muted/30 text-sm font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Use Current Location */}
              <button
                onClick={handleLocateMe}
                disabled={isLocating}
                className="flex items-center gap-2.5 text-sm font-bold transition-colors hover:opacity-70 disabled:opacity-50"
              >
                {isLocating ? (
                  <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                ) : (
                  <LocateFixed className="h-4 w-4 text-foreground" />
                )}
                <span>{isLocating ? "Detecting location…" : "Use Current Location"}</span>
              </button>

              {/* Detected city feedback */}
              <AnimatePresence>
                {detectedCityName && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl border border-border bg-muted/30 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Navigation className="h-3.5 w-3.5 text-foreground/60" />
                      <span className="font-bold">{detectedCityName}</span>
                    </div>
                    {CITIES.some(c => c.toLowerCase() === detectedCityName.toLowerCase()) ? (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-foreground text-background px-2.5 py-0.5 rounded-full">
                        Found
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-wider border border-border text-muted-foreground px-2.5 py-0.5 rounded-full">
                        Not listed
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              {errorMsg && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive text-xs font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Popular Cities — hidden when searching */}
              {!search && (
                <div className="space-y-3">
                  <h3 className="text-base font-black tracking-tight">Popular Cities</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {POPULAR_CITIES.map((city) => {
                      const isActive = selectedCity === city;
                      return (
                        <button
                          key={city}
                          onClick={() => handleSelect(city as City)}
                          className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl border transition-all duration-200 active:scale-95 ${
                            isActive
                              ? "bg-foreground border-foreground text-background"
                              : "bg-muted/40 border-border/40 hover:border-border hover:bg-muted/70 text-foreground"
                          }`}
                        >
                          <Building2 className={`h-7 w-7 ${isActive ? "text-background" : "text-foreground/50"}`} />
                          <span className="text-[11px] font-bold leading-tight text-center">{city}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Cities */}
              <div className="space-y-3">
                <h3 className="text-base font-black tracking-tight">
                  {search ? "Search Results" : "All Cities"}
                </h3>

                {/* A–Z nav — hidden when searching */}
                {!search && (
                  <div className="flex flex-wrap gap-0.5">
                    {ALPHABET.map((letter) => {
                      const has = availableLetters.has(letter);
                      return (
                        <button
                          key={letter}
                          onClick={() => has && setActiveLetter(letter)}
                          disabled={!has}
                          className={`h-7 w-7 text-xs font-black rounded-lg transition-all ${
                            activeLetter === letter
                              ? "bg-foreground text-background"
                              : has
                              ? "text-foreground hover:bg-muted"
                              : "text-muted-foreground/25 cursor-not-allowed"
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* City list */}
                {filteredCities.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5">
                    {filteredCities.map((city) => {
                      const isActive = selectedCity === city;
                      return (
                        <button
                          key={city}
                          onClick={() => handleSelect(city as City)}
                          className={`text-left text-sm py-2 px-1 rounded-lg truncate transition-colors hover:bg-muted/40 ${
                            isActive
                              ? "font-black text-foreground"
                              : "font-semibold text-foreground/70 hover:text-foreground"
                          }`}
                        >
                          {city}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No cities found for "{search}"
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CitySelectModal;
