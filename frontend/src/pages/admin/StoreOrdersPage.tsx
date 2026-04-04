import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package, MapPin, Phone, Mail, ChevronDown, ChevronUp,
  ShoppingBag, Filter,
} from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  shipped: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const ALL_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const StoreOrdersPage = () => {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-store-orders", filterStatus],
    queryFn: async () => {
      const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const { data } = await api.get(`/store-orders/admin${params}`);
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/store-orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-store-orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o: any) => o.status === "pending").length || 0,
    delivered: orders?.filter((o: any) => o.status === "delivered").length || 0,
    revenue: orders?.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0) || 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase italic">Store Orders</h1>
          <p className="text-sm text-muted-foreground">Manage and track all local store orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.total, color: "text-foreground" },
          { label: "Pending", value: stats.pending, color: "text-amber-500" },
          { label: "Delivered", value: stats.delivered, color: "text-emerald-500" },
          { label: "Revenue", value: `₹${stats.revenue.toFixed(0)}`, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border p-6 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          ))}
        </div>
      ) : orders?.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed p-16 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders?.map((order: any) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border shadow-sm overflow-hidden"
            >
              {/* Row */}
              <div className="flex items-center gap-4 p-5">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm">{order.storeName}</p>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">#{order._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.customer.name} · {order.customer.phone} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-black text-sm">₹{order.totalAmount.toFixed(0)}</span>
                  <Select
                    value={order.status}
                    onValueChange={(val) => updateStatus.mutate({ id: order._id, status: val })}
                  >
                    <SelectTrigger className={`w-32 h-8 rounded-xl border text-xs font-bold capitalize ${STATUS_STYLES[order.status] || ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    {expanded === order._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === order._id && (
                <div className="border-t bg-muted/20 p-5 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Customer */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</p>
                      <div className="space-y-1.5 text-sm">
                        <p className="font-bold">{order.customer.name}</p>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{order.customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{order.customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{order.customer.address}</span>
                        </div>
                        {order.notes && (
                          <p className="italic text-muted-foreground text-xs mt-1">Note: {order.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item: any, idx: number) => {
                          const finalPrice = item.price * (1 - (item.discountPercent || 0) / 100);
                          return (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                {item.image && <img src={item.image} alt={item.name} className="h-8 w-8 rounded-lg object-cover" />}
                                <span>{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                              </div>
                              <span className="font-bold">₹{(finalPrice * item.quantity).toFixed(0)}</span>
                            </div>
                          );
                        })}
                        <div className="pt-2 border-t flex justify-between font-black">
                          <span className="text-xs text-muted-foreground capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Razorpay)"}</span>
                          <span>₹{order.totalAmount.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreOrdersPage;
