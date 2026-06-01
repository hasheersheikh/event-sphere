import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Navigation, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { CITIES, City, useCity } from "@/contexts/CityContext";

const CitySelectModal = () => {
  const { showCityModal, setShowCityModal, setSelectedCity, selectedCity } = useCity();
  const [detectedCityName, setDetectedCityName] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelect = (city: City) => {
    setSelectedCity(city);
    setDetectedCityName(null);
  };

  const handleSkip = () => {
    setSelectedCity(null);
    localStorage.setItem("citypulse_city_selected", "true");
    setShowCityModal(false);
  };

  // Request browser location
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
            {
              headers: {
                "User-Agent": "CityPulseEventSphere/1.0 (hashirsheikh@github)"
              }
            }
          );
          if (!res.ok) throw new Error("Location lookup failed.");
          const data = await res.json();
          const addr = data.address;

          if (addr) {
            const detectedCity = addr.city || addr.town || addr.village || addr.municipality;
            if (detectedCity) {
              setDetectedCityName(detectedCity);

              // Check if matched in standard CITIES
              const matchedCity = CITIES.find(
                (c) => c.toLowerCase() === detectedCity.toLowerCase()
              );
              if (matchedCity) {
                setSelectedCity(matchedCity);
              } else {
                setSelectedCity(null);
              }
            } else {
              setErrorMsg("Could not identify city name.");
            }
          } else {
            setErrorMsg("No address details found.");
          }
        } catch (err) {
          console.error("Location lookup error:", err);
          setErrorMsg("Failed to retrieve city information.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
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
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
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

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Geolocation Button */}
              <div className="space-y-2">
                <button
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-wider text-[10px] shadow-sm transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-85"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Detecting City...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      <span>Detect My Location</span>
                    </>
                  )}
                </button>

                {/* Location Feedback */}
                <AnimatePresence>
                  {detectedCityName && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="p-3 rounded-xl border border-border bg-muted/30 text-left text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">
                          Detected City
                        </span>
                        <span className="font-black text-foreground uppercase text-[11px] block mt-0.5">
                          {detectedCityName}
                        </span>
                      </div>

                      {/* Coverage indicator */}
                      {CITIES.some((c) => c.toLowerCase() === detectedCityName.toLowerCase()) ? (
                        <span className="text-[9px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Supported
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Unsupported
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Geolocation Errors */}
                {errorMsg && (
                  <div className="p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-[10px] font-bold flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Supported cities selection grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Supported Cities
                  </span>
                  {(selectedCity || detectedCityName) && (
                    <button
                      onClick={() => {
                        setSelectedCity(null);
                        setDetectedCityName(null);
                        setErrorMsg(null);
                      }}
                      className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RefreshCw className="h-2 w-2" />
                      Reset
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {CITIES.map((city) => {
                    const isActive = selectedCity === city;
                    return (
                      <button
                        key={city}
                        onClick={() => handleSelect(city)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                            : "bg-muted/20 border-border/50 text-foreground hover:border-primary/20 hover:bg-primary/5"
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wide">{city}</span>
                        <MapPin className={`h-3 w-3 shrink-0 ${isActive ? "text-primary animate-bounce" : "text-primary/60"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Browse All Cities (Skip)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CitySelectModal;
