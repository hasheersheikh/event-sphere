import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ShoppingBag, ArrowUpRight, ImageIcon } from "lucide-react";
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1], delay: index * 0.04 }}
      className="group h-full"
    >
      <Link to={`/local-stores/${store._id}`} className="block h-full">
        <article className="h-full flex flex-col bg-card border border-border/40 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300">

          {/* ── image ── */}
          <div className="relative h-44 overflow-hidden bg-muted shrink-0">
            <AnimatedShimmer visible={!imageLoaded} />

            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={imageLoaded ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {store.photos?.[0] ? (
                <SafeImage
                  src={store.photos[0]}
                  alt={store.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center" onLoad={() => setImageLoaded(true)}>
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
                </div>
              )}
            </motion.div>

            {/* gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* category badge */}
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-block px-2 py-1 bg-white/90 text-black rounded font-black uppercase tracking-wider text-[8px]">
                {store.category}
              </span>
            </div>
          </div>

          {/* ── content ── */}
          <div className="p-4 flex-1 flex flex-col gap-2">
            <h3 className="font-black text-sm tracking-tight leading-snug group-hover:text-primary transition-colors">
              {store.name}
            </h3>

            <div className="flex items-start gap-1.5 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium line-clamp-1">{store.address}</p>
            </div>

            {store.description && (
              <p className="text-[11px] text-muted-foreground/80 font-medium line-clamp-2 leading-relaxed">
                {store.description}
              </p>
            )}

            <div className="mt-auto pt-3 border-t border-border/30 flex items-center justify-between">
              {showProducts && store.products?.length > 0 ? (
                <div className="flex -space-x-2">
                  {store.products.slice(0, 3).map((p) => (
                    <div key={p._id} className="h-7 w-7 rounded-full border-2 border-background overflow-hidden bg-muted">
                      {p.image ? (
                        <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-3 w-3 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  ))}
                  {store.products.length > 3 && (
                    <div className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-black text-muted-foreground">
                      +{store.products.length - 3}
                    </div>
                  )}
                </div>
              ) : <div />}

              <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

const AnimatedShimmer = ({ visible }: { visible: boolean }) => (
  <motion.div
    className="absolute inset-0 overflow-hidden bg-muted"
    animate={{ opacity: visible ? 1 : 0 }}
    transition={{ duration: 0.3 }}
    style={{ pointerEvents: visible ? "auto" : "none" }}
  >
    <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground/20" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{ x: ["-100%", "200%"] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

export default StoreCard;
