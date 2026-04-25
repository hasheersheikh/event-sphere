import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Store } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import StoreCard from "@/components/stores/StoreCard";

const CATEGORIES = [
  "All",
  "Food & Beverage",
  "Grocery",
  "Bakery",
  "Crafts & Art",
  "Fashion",
  "Electronics",
  "Books",
  "Health & Beauty",
  "General",
];

const LocalStoresPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: stores, isLoading } = useQuery({
    queryKey: ["localStores"],
    queryFn: async () => {
      const { data } = await api.get("/local-stores");
      return (data.data || []) as any[];
    },
  });

  const filteredStores = stores?.filter((store: any) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || store.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-14 md:pt-16">

        {/* ─── Header ─── */}
        <section className="border-b border-border/20 py-8 md:py-10">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-primary mb-2">
                Community
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
                Local Stores
                {stores?.length > 0 && (
                  <span className="text-muted-foreground/50 ml-3 text-2xl md:text-3xl font-bold">
                    {stores.length}
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground text-sm mt-2 max-w-md">
                Discover curated shops from your neighbourhood.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="relative max-w-md"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Search stores…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10 bg-card border-border/50 rounded-xl font-medium text-sm"
              />
            </motion.div>
          </div>
        </section>

        {/* ─── Category pills ─── */}
        <section className="border-b border-border/20 py-3 sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur-xl">
          <div className="container">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-200 shrink-0",
                    selectedCategory === cat
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Grid ─── */}
        <section className="container py-8">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-48 rounded-xl bg-muted animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredStores?.length === 0 ? (
            <div className="py-24 text-center space-y-6 border border-dashed border-border/50 rounded-2xl">
              <Store className="h-10 w-10 text-muted-foreground/20 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tighter">No stores found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Try adjusting your search or category filters.
                </p>
              </div>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredStores?.map((store: any, index: number) => (
                  <motion.div
                    key={store._id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <StoreCard store={store} index={index} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LocalStoresPage;
