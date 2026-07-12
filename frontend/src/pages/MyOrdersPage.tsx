import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingBag, Package, Clock, MapPin, ChevronRight, CheckCircle2, Truck, AlertCircle, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_CONFIG: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    classes: "bg-amber-500/15 text-amber-400",              icon: <Clock className="h-3 w-3" /> },
  confirmed:  { label: "Confirmed",  classes: "bg-blue-500/15 text-blue-400",                icon: <CheckCircle2 className="h-3 w-3" /> },
  processing: { label: "Processing", classes: "bg-purple-500/15 text-purple-400",            icon: <RotateCcw className="h-3 w-3" /> },
  shipped:    { label: "Shipped",    classes: "bg-cyan-500/15 text-cyan-400",                icon: <Truck className="h-3 w-3" /> },
  delivered:  { label: "Delivered",  classes: "bg-[#C4F000]/15 text-[#C4F000]",             icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled:  { label: "Cancelled",  classes: "bg-rose-500/15 text-rose-400",               icon: <AlertCircle className="h-3 w-3" /> },
};

const MyOrdersPage = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-store-orders"],
    queryFn: async () => {
      const { data } = await api.get("/store-orders/my");
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16 pb-24">
        {/* Page header */}
        <div className="border-b border-border/20 py-8">
          <div className="container">
            <p className="text-[9px] font-black uppercase tracking-[0.6em] text-muted-foreground/50 mb-1">My Account</p>
            <div className="flex items-end gap-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">My Orders</h1>
              {!isLoading && orders?.length > 0 && (
                <span className="mb-1 text-sm font-black text-[#C4F000]">
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="container py-10">
          {isLoading ? (
            <div className="space-y-5">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border overflow-hidden">
                  <div className="bg-zinc-900/60 px-5 py-4 flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-white/10" />
                      <Skeleton className="h-3 w-48 bg-white/10" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                  </div>
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <div className="pt-3 border-t border-border/40 flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            /* ── Empty state ── */
            <div className="rounded-2xl border border-dashed border-border/50 p-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-[#C4F000]/10 flex items-center justify-center mx-auto mb-5">
                <ShoppingBag className="h-8 w-8 text-[#C4F000]" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2">No orders yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Browse local stores and place your first order.</p>
              <Link to="/local-stores">
                <button className="px-6 py-2.5 rounded-xl bg-[#C4F000] text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#A3C800] transition-colors">
                  Browse Stores
                </button>
              </Link>
            </div>
          ) : (
            /* ── Order list ── */
            <div className="space-y-5">
              {orders.map((order: any, idx: number) => {
                const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                const isDelivered = order.status === "delivered";
                const isCancelled = order.status === "cancelled";

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.30)]"
                  >
                    {/* ── Dark header ── */}
                    <div className="bg-zinc-950 px-5 py-4 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isDelivered ? "bg-[#C4F000]/15" : "bg-white/10"}`}>
                          <Package className={`h-4 w-4 ${isDelivered ? "text-[#C4F000]" : "text-white/60"}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-white text-sm truncate">{order.storeName}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-0.5">
                            #{order._id.slice(-6).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className={`shrink-0 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full ${status.classes}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    {/* ── Perforation ── */}
                    <div className="relative flex items-center bg-zinc-950">
                      <div className="h-4 w-4 rounded-full bg-background -ml-2 shrink-0 border border-border/60" />
                      <div className="flex-1 border-t-2 border-dashed border-border/40" />
                      <div className="h-4 w-4 rounded-full bg-background -mr-2 shrink-0 border border-border/60" />
                    </div>

                    {/* ── Items ── */}
                    <div className="px-5 pt-4 pb-2 space-y-2">
                      {order.items.map((item: any, i: number) => {
                        const finalPrice = item.price * (1 - (item.discountPercent || 0) / 100);
                        const lineTotal = (finalPrice * item.quantity).toFixed(0);
                        return (
                          <div key={i} className="flex items-center gap-3 py-1.5">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-10 w-10 rounded-xl object-cover border border-border/40 shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 border border-border/30">
                                <Package className="h-4 w-4 text-muted-foreground/40" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black truncate">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground font-bold">×{item.quantity}</p>
                            </div>
                            <span className="text-sm font-black text-foreground shrink-0">₹{lineTotal}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* ── Total + meta ── */}
                    <div className="px-5 py-4 border-t border-border/30 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="text-[10px] font-bold truncate max-w-[200px]">{order.customer.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            order.paymentMethod === "cod"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-[#C4F000]/10 text-[#C4F000]"
                          }`}>
                            {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
                          </span>
                          {order.notes && (
                            <span className="text-[10px] text-muted-foreground italic truncate max-w-[120px]">"{order.notes}"</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Total</p>
                        <p className={`text-xl font-black tracking-tight ${isDelivered ? "text-[#C4F000]" : "text-foreground"}`}>
                          ₹{order.totalAmount.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyOrdersPage;
