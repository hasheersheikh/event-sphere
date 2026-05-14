import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag, MapPin, ChevronLeft, Sparkles, Store,
  Phone, Mail, MessageCircle, Globe, Instagram, Facebook,
  Clock, CreditCard, Plus, ExternalLink, Tag,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useLocalStoreCart } from "@/contexts/LocalStoreCartContext";
import { toast } from "sonner";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash on Delivery",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank Transfer",
};

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
        <main className="flex-1 container py-24 space-y-8">
          <div className="h-72 w-full bg-muted animate-pulse rounded-[2rem]" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded-full" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 rounded-[1.5rem] bg-muted animate-pulse" />
            ))}
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
          <Link to="/local-stores" className="mt-8 inline-block text-neon-lime font-black uppercase tracking-widest text-xs hover:underline">
            Back to Stores
          </Link>
        </main>
      </div>
    );
  }

  const hasContact = store.contactEmail || store.contactPhone || store.whatsapp || store.openingHours || store.googleMapUrl;
  const hasSocial = store.instagram || store.facebook || store.website;
  const hasPayment = store.paymentMethods?.length > 0 || store.upiId || store.bankDetails?.accountNumber;
  const hasSidebar = hasContact || hasSocial || hasPayment;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-neon-lime/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-neon-lime/5 rounded-full blur-[140px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <Navbar />

      <main className="flex-1 relative z-10">
        {/* Hero Banner */}
        <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
          {store.photos?.[0] ? (
            <img
              src={store.photos[0]}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neon-lime/10 via-muted/30 to-background flex items-center justify-center">
              <Store className="h-24 w-24 text-neon-lime/10" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

          {/* Back button overlaid on hero */}
          <div className="absolute top-6 left-0 right-0 container">
            <Link
              to="/local-stores"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-background/60 backdrop-blur-md border border-border/50 text-foreground hover:text-neon-lime px-4 py-2 rounded-xl transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to Local Gems
            </Link>
          </div>
        </div>

        {/* Store Identity — sits below hero, overlapping slightly */}
        <div className="container -mt-16 relative z-10 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <Badge className="bg-neon-lime text-black px-3 py-1 rounded-lg font-black uppercase tracking-[0.2em] text-[8px] border-none shadow-lg">
                {store.category}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">
                {store.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                <span className="flex items-center gap-1.5 italic">
                  <MapPin className="h-3.5 w-3.5 text-neon-lime shrink-0" />
                  {store.address}
                </span>
                {store.openingHours && (
                  <span className="flex items-center gap-1.5 italic">
                    <Clock className="h-3.5 w-3.5 text-neon-lime" />
                    {store.openingHours}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-neon-lime bg-neon-lime/10 px-4 py-2 rounded-xl border border-neon-lime/20 shrink-0 self-start md:self-auto">
              <Sparkles className="h-4 w-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Premium Partner</span>
            </div>
          </div>

          {store.description && (
            <p className="mt-5 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed italic font-medium opacity-90">
              {store.description}
            </p>
          )}
        </div>

        {/* Photo Strip (if multiple photos) */}
        {store.photos?.length > 1 && (
          <div className="container mb-10">
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {store.photos.slice(1).map((photo: string, i: number) => (
                <img
                  key={i}
                  src={photo}
                  alt={`${store.name} photo ${i + 2}`}
                  className="h-28 w-44 object-cover rounded-2xl border border-border/50 shrink-0"
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container pb-24">
          <div className={`flex flex-col ${hasSidebar ? "lg:flex-row" : ""} gap-10`}>
            {/* Products Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between border-b border-border/50 pb-5 mb-8">
                <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                  The <span className="text-neon-lime">Collection</span>
                </h2>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                  {store.products?.length || 0} items
                </span>
              </div>

              {store.products?.length ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {store.products.map((product: any) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      storeId={store._id}
                      storeName={store.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-card/20 rounded-[2rem] border border-dashed border-border/50">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No products yet.</p>
                  <p className="text-xs text-muted-foreground/60 italic mt-1">New items coming soon.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            {hasSidebar && (
              <aside className="lg:w-80 xl:w-96 space-y-5 shrink-0">
                {/* Contact */}
                {hasContact && (
                  <InfoCard title="Contact" accent="Us">
                    <div className="space-y-3">
                      {store.contactPhone && (
                        <ContactRow
                          href={`tel:${store.contactPhone}`}
                          icon={<Phone className="h-4 w-4 text-neon-lime" />}
                          bg="bg-neon-lime/10 hover:bg-neon-lime/20"
                          label={store.contactPhone}
                        />
                      )}
                      {store.contactEmail && (
                        <ContactRow
                          href={`mailto:${store.contactEmail}`}
                          icon={<Mail className="h-4 w-4 text-neon-lime" />}
                          bg="bg-neon-lime/10 hover:bg-neon-lime/20"
                          label={store.contactEmail}
                        />
                      )}
                      {store.whatsapp && (
                        <ContactRow
                          href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                          external
                          icon={<MessageCircle className="h-4 w-4 text-emerald-500" />}
                          bg="bg-emerald-500/10 hover:bg-emerald-500/20"
                          label="Chat on WhatsApp"
                        />
                      )}
                      {store.openingHours && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="h-8 w-8 rounded-lg bg-neon-lime/10 flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4 text-neon-lime" />
                          </div>
                          <span className="font-medium text-xs">{store.openingHours}</span>
                        </div>
                      )}
                      {store.googleMapUrl && (
                        <ContactRow
                          href={store.googleMapUrl}
                          external
                          icon={<MapPin className="h-4 w-4 text-blue-500" />}
                          bg="bg-blue-500/10 hover:bg-blue-500/20"
                          label="View on Map"
                        />
                      )}
                    </div>
                  </InfoCard>
                )}

                {/* Social */}
                {hasSocial && (
                  <InfoCard title="Find Us" accent="Online">
                    <div className="space-y-3">
                      {store.website && (
                        <ContactRow
                          href={store.website}
                          external
                          icon={<Globe className="h-4 w-4 text-blue-500" />}
                          bg="bg-blue-500/10 hover:bg-blue-500/20"
                          label={store.website.replace(/^https?:\/\//, "")}
                        />
                      )}
                      {store.instagram && (
                        <ContactRow
                          href={`https://instagram.com/${store.instagram.replace("@", "")}`}
                          external
                          icon={<Instagram className="h-4 w-4 text-pink-500" />}
                          bg="bg-pink-500/10 hover:bg-pink-500/20"
                          label={`@${store.instagram.replace("@", "")}`}
                        />
                      )}
                      {store.facebook && (
                        <ContactRow
                          href={store.facebook.startsWith("http") ? store.facebook : `https://facebook.com/${store.facebook}`}
                          external
                          icon={<Facebook className="h-4 w-4 text-blue-600" />}
                          bg="bg-blue-600/10 hover:bg-blue-600/20"
                          label="Facebook"
                        />
                      )}
                    </div>
                  </InfoCard>
                )}

                {/* Payment */}
                {hasPayment && (
                  <InfoCard title="Payment" accent="Methods">
                    <div className="space-y-3">
                      {store.paymentMethods?.map((m: string) => (
                        <div key={m} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-neon-lime/10 flex items-center justify-center shrink-0">
                            <CreditCard className="h-4 w-4 text-neon-lime" />
                          </div>
                          <span className="text-sm font-bold">{PAYMENT_LABELS[m] || m}</span>
                        </div>
                      ))}
                      {store.upiId && (
                        <div className="mt-2 p-3 bg-muted/40 rounded-xl">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">UPI ID</p>
                          <p className="text-sm font-black text-neon-lime">{store.upiId}</p>
                        </div>
                      )}
                      {store.bankDetails?.accountNumber && (
                        <div className="mt-2 p-3 bg-muted/40 rounded-xl space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Bank Details</p>
                          {store.bankDetails.accountHolder && <p className="text-xs font-bold">{store.bankDetails.accountHolder}</p>}
                          {store.bankDetails.bankName && <p className="text-xs text-muted-foreground">{store.bankDetails.bankName}</p>}
                          <p className="text-xs font-black text-neon-lime">{store.bankDetails.accountNumber}</p>
                          {store.bankDetails.ifscCode && <p className="text-xs text-muted-foreground">IFSC: {store.bankDetails.ifscCode}</p>}
                        </div>
                      )}
                    </div>
                  </InfoCard>
                )}
              </aside>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

/* ─── Small reusable pieces ──────────────────────────────────────── */

const InfoCard = ({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) => (
  <div className="bg-card/40 border border-border/50 rounded-2xl p-6 space-y-4">
    <h3 className="text-sm font-black tracking-tighter uppercase italic">
      {title} <span className="text-neon-lime">{accent}</span>
    </h3>
    {children}
  </div>
);

const ContactRow = ({
  href, external = false, icon, bg, label,
}: {
  href: string; external?: boolean; icon: React.ReactNode; bg: string; label: string;
}) => (
  <a
    href={href}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
  >
    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${bg}`}>
      {icon}
    </div>
    <span className="font-medium text-xs truncate">{label}</span>
    {external && <ExternalLink className="h-3 w-3 ml-auto shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />}
  </a>
);

const ProductCard = ({ product, storeId, storeName }: { product: any; storeId: string; storeName: string }) => {
  const { addItem } = useLocalStoreCart();
  const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);

  const handleAdd = () => {
    if (!product.isAvailable) return;
    addItem({
      storeId,
      storeName,
      productId: product._id,
      name: product.name,
      price: product.price,
      discountPercent: product.discountPercent,
      image: product.image,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-neon-lime/30 hover:shadow-lg hover:shadow-neon-lime/5 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="h-48 relative overflow-hidden bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
          </div>
        )}

        {product.discountPercent > 0 && (
          <Badge className="absolute top-3 left-3 bg-rose-500 text-white px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider text-[8px] border-none shadow">
            <Tag className="h-2.5 w-2.5 mr-1 inline" />
            {product.discountPercent}% OFF
          </Badge>
        )}

        {!product.isAvailable && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background/80 px-3 py-1.5 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-black tracking-tight uppercase leading-tight line-clamp-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed flex-1">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/40">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-neon-lime">₹{finalPrice.toFixed(0)}</span>
            {product.discountPercent > 0 && (
              <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.isAvailable}
            className="h-8 w-8 rounded-lg bg-neon-lime hover:bg-neon-lime text-black flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StoreDetailPage;
