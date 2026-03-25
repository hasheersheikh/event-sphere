import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  MapPin,
  ChevronLeft,
  Sparkles,
  Store,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const StoreDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: store, isLoading } = useQuery({
    queryKey: ["localStore", id],
    queryFn: async () => {
      const { data } = await api.get(`/local-stores/${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-24">
          <div className="h-64 w-full bg-muted animate-pulse rounded-[3rem]" />
          <div className="mt-12 space-y-8">
            <div className="h-12 w-1/3 bg-muted animate-pulse rounded-full" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-64 rounded-[2.5rem] bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-24 text-center">
          <h2 className="text-4xl font-black uppercase italic">Store not found</h2>
          <Link to="/local-stores">
            <Button className="mt-8">Back to Stores</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <Navbar />

      <main className="flex-1 container py-12 md:py-24 relative z-10">
        <Link
          to="/local-stores"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-amber-500 transition-colors mb-12"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Local Gems
        </Link>

        {/* Store Header */}
        <section className="relative rounded-[3rem] overflow-hidden border border-border/50 bg-card/30 backdrop-blur-xl mb-16">
          <div className="h-64 md:h-80 w-full relative">
            {store.photos?.[0] ? (
              <img src={store.photos[0]} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-500/10 to-background flex items-center justify-center">
                <Store className="h-24 w-24 text-amber-500/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>

          <div className="p-8 md:p-12 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <Badge className="bg-amber-500 text-black px-4 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] border-none shadow-xl">
                  {store.category}
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                  {store.name}
                </h1>
                <div className="flex items-start gap-2 text-muted-foreground font-medium italic">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{store.address}</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3 text-amber-500 bg-amber-500/5 px-6 py-4 rounded-3xl border border-amber-500/20">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Premium Partner</span>
              </div>
            </div>

            <p className="mt-10 text-lg text-muted-foreground max-w-3xl leading-relaxed italic font-medium">
              {store.description || "A local neighbourhood favourite, bringing you the best in quality and tradition."}
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="space-y-12 pb-32">
          <div className="flex items-center justify-between border-b border-border/50 pb-8">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
              The <span className="text-amber-500">Collection.</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              {store.products?.length || 0} items
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {store.products?.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {!store.products?.length && (
            <div className="py-24 text-center bg-card/20 rounded-[3rem] border border-dashed border-border/50">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No products yet.</p>
              <p className="text-xs text-muted-foreground/60 italic mt-2">New items coming soon.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

const ProductCard = ({ product }: { product: any }) => {
  const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-card/40 border border-border/50 rounded-[2.5rem] overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl"
    >
      <div className="h-56 relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        {product.discountPercent > 0 && (
          <div className="absolute top-6 left-6">
            <Badge className="bg-rose-500 text-white px-3 py-1 rounded-xl font-black uppercase tracking-widest text-[8px] border-none shadow-lg">
              {product.discountPercent}% OFF
            </Badge>
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unavailable</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
      </div>

      <div className="p-6 space-y-3">
        <h3 className="text-lg font-black tracking-tighter uppercase italic leading-none truncate">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground font-medium italic line-clamp-2 leading-relaxed">
          {product.description || "Crafted with local passion."}
        </p>
        <div className="flex items-center gap-2 pt-2 border-t border-border/40">
          <span className="text-xl font-black text-amber-500 italic">₹{finalPrice.toFixed(0)}</span>
          {product.discountPercent > 0 && (
            <span className="text-xs text-muted-foreground line-through font-bold">₹{product.price}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StoreDetailPage;
