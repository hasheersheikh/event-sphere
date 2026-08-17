import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import api from "@/lib/api";
import StoreCard from "@/components/stores/StoreCard";
import StoreSlider from "@/components/stores/StoreSlider";
import MarqueeCarousel from "@/components/events/MarqueeCarousel";
import MobileMarqueeCarousel from "@/components/events/MobileMarqueeCarousel";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { cn } from "@/lib/utils";

const STORE_CATEGORIES = [
  "All",
  "Fashion",
  "Beauty",
  "Home Décor",
  "Handicrafts",
  "Gifts & Toys",
  "Art & Culture",
  "Electronics",
];

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPercent?: number;
  image?: string;
  isAvailable: boolean;
}

interface LocalStore {
  _id: string;
  name: string;
  address: string;
  description?: string;
  listingPhoto?: string;
  bannerPhoto?: string;
  photos: string[];
  category: string;
  products: Product[];
}

const GoLocalSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: stores, isLoading } = useQuery({
    queryKey: ["localStores"],
    queryFn: async () => {
      const { data } = await api.get("/local-stores");
      return (data.data || []) as LocalStore[];
    },
  });

  const filteredStores = stores?.filter((store: LocalStore) => {
    if (selectedCategory === "All") return true;
    return store.category === selectedCategory;
  }) || [];

  if (!isLoading && (!stores || stores.length === 0)) return null;

  return (
    <section className="py-8 md:py-14 border-t border-border/20 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-foreground/4 blur-[100px] rounded-full pointer-events-none" />

      <div className="container px-3 md:px-8 relative z-10">
        <PublicPageHeader
          pillText="Go Local"
          title={
            <>
              Unique <span className="text-neon-lime">Stores</span>
            </>
          }
          size="md"
          className="text-center"
        />

        {/* Category pills */}
        <div className="mb-6 md:mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-5 md:pb-1 pl-3 pr-4 md:px-8 justify-start md:justify-center">
            {STORE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] px-3 md:px-4 py-1.5 rounded-full border transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-foreground text-background border-transparent"
                    : "bg-transparent text-foreground border-border/40 hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-80 w-80 rounded-3xl bg-muted animate-pulse flex-shrink-0"
                />
              ))}
          </div>
        ) : (
          <>
            {/* Mobile: snap carousel, one active card, dots — same engine as Upcoming Events */}
            <div className="md:hidden">
              <MobileMarqueeCarousel>
                {filteredStores.map((store, index) => (
                  <StoreCard key={store._id} store={store} index={index} />
                ))}
              </MobileMarqueeCarousel>
            </div>

            {/* Desktop: continuous drift marquee */}
            <div className="hidden md:block">
              <MarqueeCarousel>
                {filteredStores.map((store, index) => (
                  <div key={store._id} className="w-[21.6rem] flex-shrink-0">
                    <StoreCard store={store} index={index} />
                  </div>
                ))}
              </MarqueeCarousel>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default GoLocalSection;
