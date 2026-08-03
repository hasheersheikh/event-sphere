import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import api from "@/lib/api";
import StoreCard from "@/components/stores/StoreCard";
import StoreSlider from "@/components/stores/StoreSlider";
import MarqueeCarousel from "@/components/events/MarqueeCarousel";
import MobileMarqueeCarousel from "@/components/events/MobileMarqueeCarousel";
import PublicPageHeader from "@/components/layout/PublicPageHeader";

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
  photos: string[];
  category: string;
  products: Product[];
}

const GoLocalSection = () => {
  const { data: stores, isLoading } = useQuery({
    queryKey: ["localStores"],
    queryFn: async () => {
      const { data } = await api.get("/local-stores");
      return (data.data || []) as LocalStore[];
    },
  });

  if (!isLoading && (!stores || stores.length === 0)) return null;

  return (
    <section className="py-8 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-foreground/4 blur-[100px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
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
                {stores?.map((store, index) => (
                  <StoreCard key={store._id} store={store} index={index} />
                ))}
              </MobileMarqueeCarousel>
            </div>

            {/* Desktop: continuous drift marquee */}
            <div className="hidden md:block">
              <MarqueeCarousel>
                {stores?.map((store, index) => (
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
