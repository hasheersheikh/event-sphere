import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import api from "@/lib/api";
import StoreCard from "@/components/stores/StoreCard";
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
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <PublicPageHeader
          pillText="Nearby Gems"
          title={
            <>
              Go <span className="text-amber-400 italic">Local.</span>
            </>
          }
          subtitle="Discover handpicked local stores around you — fresh produce, artisan crafts, neighbourhood favourites."
          themeColor="amber"
          size="md"
        />

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl bg-muted animate-pulse"
                />
              ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store) => (
              <StoreCard key={store._id} store={store} showProducts={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GoLocalSection;
