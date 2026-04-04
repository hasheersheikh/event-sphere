import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingBag, Package, Clock, MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  shipped: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-500 border-rose-500/20",
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
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Store Orders</h1>
          <p className="text-muted-foreground text-lg">Track your orders from local stores</p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border p-6 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <div className="bg-background rounded-2xl border border-dashed p-16 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Browse local stores and place your first order.</p>
            <Link to="/local-stores">
              <Button>Browse Stores</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order: any) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{order.storeName}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        Order #{order._id.slice(-6).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={`border capitalize text-xs font-bold ${STATUS_STYLES[order.status] || ""}`}>
                    {order.status}
                  </Badge>
                </div>

                {/* Items */}
                <div className="p-5 space-y-2">
                  {order.items.map((item: any, idx: number) => {
                    const finalPrice = item.price * (1 - (item.discountPercent || 0) / 100);
                    return (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {item.image && <img src={item.image} alt={item.name} className="h-8 w-8 rounded-lg object-cover" />}
                          <span className="font-medium">{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                        </div>
                        <span className="font-bold text-amber-500">₹{(finalPrice * item.quantity).toFixed(0)}</span>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
                    </span>
                    <span className="font-black text-base">₹{order.totalAmount.toFixed(0)}</span>
                  </div>
                </div>

                {/* Delivery info */}
                <div className="px-5 pb-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{order.customer.address}</span>
                  </div>
                  {order.notes && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="italic">{order.notes}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyOrdersPage;
