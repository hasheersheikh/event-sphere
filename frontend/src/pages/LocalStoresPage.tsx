import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ShoppingBag,
  MapPin,
  ChevronRight,
  Sparkles,
  Store,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
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
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || store.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <Navbar />

      <main className="flex-1 container pt-12 pb-16 md:pt-16 md:pb-24 relative z-10">
        {/* Header Section */}
        <PublicPageHeader
          pillText="Community Commerce"
          title={
            <>
              Discover <span className="text-amber-400 italic">Local Gems.</span>
            </>
          }
          subtitle="Curated stores from your neighbourhood, delivered to your doorstep. Fresh, authentic, and uniquely local."
          themeColor="amber"
          size="md"
          className="mb-12 max-w-4xl"
        />

        {/* Search & Filter Bar */}
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center gap-4 p-3 bg-card/50 border border-border/50 rounded-[2.2rem] backdrop-blur-xl shadow-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
              <Input
                placeholder="Search by store name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-14 bg-background/50 border-white/10 rounded-3xl font-bold text-base focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "whitespace-nowrap px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 flex-shrink-0",
                  selectedCategory === cat
                    ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="max-w-7xl px-6 mx-auto mt-8 space-y-12 pb-32">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="h-[400px] rounded-[3rem] bg-muted animate-pulse border border-border/10" />
                ))}
              </div>
            ) : filteredStores?.length === 0 ? (
              <div className="py-20 text-center space-y-6 bg-card/30 border border-dashed border-border/50 rounded-[3rem]">
                <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Store className="h-10 w-10 text-muted-foreground/20" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight italic">No stores found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                  Try adjusting your search or category filters to find what you're looking for.
                </p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="text-amber-500 font-black uppercase tracking-widest text-[10px] hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredStores?.map((store: any) => (
                    <motion.div
                      key={store._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <StoreCard store={store} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LocalStoresPage;
