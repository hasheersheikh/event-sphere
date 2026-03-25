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
      return data;
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

      <main className="flex-1 container py-16 md:py-24 relative z-10">
        {/* Header Section */}
        <header className="max-w-4xl mx-auto text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <div className="h-px w-10 bg-amber-500/30 rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500">
              Community Commerce
            </span>
            <div className="h-px w-10 bg-amber-500/30 rounded-full" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter leading-none"
          >
            Discover <span className="text-amber-400 italic">Local Gems.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base md:text-lg font-medium max-w-xl mx-auto italic"
          >
            Curated stores from your neighbourhood, delivered to your doorstep.
            Fresh, authentic, and uniquely local.
          </motion.p>
        </header>

        {/* Search & Filter Bar */}
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row gap-4 p-3 bg-card/50 border border-border/50 rounded-[2.2rem] backdrop-blur-xl shadow-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
              <Input
                placeholder="Search by store name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-14 bg-background/50 border-white/10 rounded-3xl font-bold text-base focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
              />
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide no-scrollbar max-md:px-2">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
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

          {/* Results Grid - Reusing the section logic but expanded */}
          <div className="space-y-12">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-[400px] rounded-[3rem] bg-muted animate-pulse border border-border/10" />
                ))}
              </div>
            ) : filteredStores?.length === 0 ? (
              <div className="py-32 text-center space-y-6 bg-card/30 border border-dashed border-border/50 rounded-[4rem]">
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
                  Reset Sensors
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
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
                      <GoLocalStoreCard store={store} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Internal component for the full-page grid (can be refactored into components later)
const GoLocalStoreCard = ({ store }: { store: any }) => {
  return (
    <div className="bg-card border border-border/60 rounded-[3rem] overflow-hidden group hover:border-amber-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 h-full flex flex-col">
       <div className="relative h-56 overflow-hidden">
        {store.photos?.[0] ? (
          <img src={store.photos[0]} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500/10 via-accent/5 to-background flex items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-amber-500/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute top-6 left-6">
          <Badge className="bg-amber-500 text-black px-4 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] border-none shadow-xl">
            {store.category}
          </Badge>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 className="text-2xl font-black tracking-tighter leading-tight italic uppercase">{store.name}</h3>
          <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl">
             <Sparkles className="h-3.5 w-3.5" />
             <span className="text-[10px] font-black uppercase tracking-widest">Featured</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-muted-foreground mb-6">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-xs font-bold leading-relaxed">{store.address}</p>
        </div>

        <p className="text-sm text-muted-foreground/80 font-medium italic mb-8 line-clamp-3">
          {store.description || "A local neighbourhood favourite, bringing you the best in quality and tradition."}
        </p>

        <div className="mt-auto space-y-6">
           <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      <div className="flex items-center justify-between">
              <div className="flex -space-x-3">
                 {store.products.slice(0, 3).map((p: any) => (
                   <div key={p._id} className="h-10 w-10 rounded-full border-2 border-card overflow-hidden bg-muted">
                      {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <ShoppingBag className="h-4 w-4 m-auto mt-2.5 text-muted-foreground/40" />}
                   </div>
                 ))}
                 {store.products.length > 3 && (
                   <div className="h-10 w-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">
                      +{store.products.length - 3}
                   </div>
                 )}
              </div>
              
              <Link to={`/local-stores/${store._id}`}>
                <button className="h-12 px-8 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[9px] hover:bg-amber-500 hover:text-black transition-all active:scale-95 flex items-center gap-2 group/btn">
                   Visit Store
                   <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LocalStoresPage;
