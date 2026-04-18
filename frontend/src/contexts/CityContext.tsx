import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const CITIES = [
  "Nagpur",
  "Pune",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Bangalore",
] as const;

export type City = (typeof CITIES)[number];

interface CityContextValue {
  selectedCity: City | null;
  setSelectedCity: (city: City | null) => void;
  showCityModal: boolean;
  setShowCityModal: (open: boolean) => void;
}

const CityContext = createContext<CityContextValue | undefined>(undefined);

const STORAGE_KEY = "citypulse_selected_city";
const VISITED_KEY = "citypulse_city_selected";

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCity, setSelectedCityState] = useState<City | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as City) || null;
  });

  const [showCityModal, setShowCityModal] = useState(false);

  useEffect(() => {
    const hasSelected = localStorage.getItem(VISITED_KEY);
    if (!hasSelected) {
      setShowCityModal(true);
    }
  }, []);

  const setSelectedCity = (city: City | null) => {
    setSelectedCityState(city);
    if (city) {
      localStorage.setItem(STORAGE_KEY, city);
      localStorage.setItem(VISITED_KEY, "true");
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setShowCityModal(false);
  };

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, showCityModal, setShowCityModal }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
};
