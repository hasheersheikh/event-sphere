import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { CITIES, City, useCity } from "@/contexts/CityContext";

const CitySelectModal = () => {
  const { showCityModal, setShowCityModal, setSelectedCity, selectedCity } = useCity();

  const handleSelect = (city: City) => {
    setSelectedCity(city);
  };

  const handleSkip = () => {
    setSelectedCity(null);
    localStorage.setItem("citypulse_city_selected", "true");
    setShowCityModal(false);
  };

  return (
    <AnimatePresence>
      {showCityModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-background border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-tight text-foreground">
                    Select Your City
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                    We'll show events near you
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-2">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleSelect(city)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                    selectedCity === city
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted/20 border-border/50 text-foreground hover:border-primary/20 hover:bg-primary/5"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                  <span className="text-[11px] font-black uppercase tracking-wide">{city}</span>
                </button>
              ))}
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={handleSkip}
                className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse All Cities
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CitySelectModal;
