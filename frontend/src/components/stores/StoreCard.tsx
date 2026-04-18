import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ShoppingBag, Sparkles, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SafeImage from "@/components/ui/SafeImage";

interface Product {
  _id: string;
  name: string;
  image?: string;
  price?: number;
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

interface StoreCardProps {
  store: LocalStore;
  index?: number;
  showProducts?: boolean;
}

const StoreCard = ({ store, index = 0, showProducts = true }: StoreCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -5, transition: { duration: 0.22, ease: "easeOut" } }}
      transition={{
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
        delay: index * 0.06,
      }}
      className="group h-full"
    >
      <Link to={`/local-stores/${store._id}`} className="block h-full">
        <article className="h-full glass-card hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-350 flex flex-col overflow-hidden">
          
          {/* ── image ── */}
          <div className="relative h-48 overflow-hidden bg-muted">
            <AnimatedShimmer visible={!imageLoaded} />

            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.07 }}
              animate={
                imageLoaded
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 1.07 }
              }
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              {store.photos?.[0] ? (
                <SafeImage
                  src={store.photos[0]}
                  alt={store.name}
                  className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.04]"
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500/10 via-accent/5 to-background flex items-center justify-center">
                   <ShoppingBag className="h-16 w-16 text-amber-500/20" />
                </div>
              )}
            </motion.div>

            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-400" />
            
            {/* Tag Badge */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-amber-500/90 text-black backdrop-blur-md px-3 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] border-none shadow-xl">
                {store.category}
              </Badge>
            </div>
          </div>

          {/* ── content ── */}
          <div className="p-6 flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-start gap-4 mb-2">
              <h3 className="text-xl font-black tracking-tighter leading-tight italic uppercase group-hover:text-amber-500 transition-colors duration-250">
                {store.name}
              </h3>
              <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-xl shrink-0">
                <Sparkles className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline-block">Featured</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-muted-foreground mb-3">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500/50" />
              <p className="text-[11px] font-bold leading-relaxed line-clamp-1">{store.address}</p>
            </div>

            <p className="text-xs text-muted-foreground/80 font-medium italic mb-6 line-clamp-2 leading-relaxed">
              {store.description || "A local neighbourhood favourite, bringing you the best in quality and tradition."}
            </p>

            <div className="mt-auto space-y-5">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="flex items-center justify-between">
                {showProducts ? (
                  <div className="flex -space-x-3">
                    {store.products?.slice(0, 3).map((p) => (
                      <div key={p._id} className="h-9 w-9 rounded-full border-2 border-background overflow-hidden bg-muted group-hover:border-card transition-colors">
                          {p.image ? (
                            <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                          ) : (
                            <ShoppingBag className="h-3.5 w-3.5 m-auto mt-2 text-muted-foreground/40" />
                          )}
                      </div>
                    ))}
                    {store.products?.length > 3 && (
                      <div className="h-9 w-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[9px] font-black text-muted-foreground group-hover:border-card transition-colors">
                          +{store.products.length - 3}
                      </div>
                    )}
                    {(!store.products || store.products.length === 0) && (
                      <span className="text-[10px] text-muted-foreground italic pl-2">No products</span>
                    )}
                  </div>
                ) : (
                  <div /> // Empty div to preserve flex space-between alignment
                )}
                
                <div className="h-9 px-5 rounded-xl bg-foreground/5 dark:bg-foreground/10 text-foreground font-black uppercase tracking-widest text-[9px] group-hover:bg-amber-500 group-hover:text-black transition-all duration-300 flex items-center gap-2">
                    Visit
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

/* shimmer skeleton */
const AnimatedShimmer = ({ visible }: { visible: boolean }) => (
  <motion.div
    className="absolute inset-0 overflow-hidden bg-muted"
    animate={{ opacity: visible ? 1 : 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/8 to-transparent -translate-x-full"
      animate={{ x: ["−100%", "200%"] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      style={{ transform: "translateX(-100%)" }}
    />
  </motion.div>
);

export default StoreCard;
