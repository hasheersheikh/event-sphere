import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package, MapPin, Phone, Mail, ChevronDown, ChevronUp,
  ShoppingBag,
} from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { PortalGrid } from "@/components/portal/PortalGrid";

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
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-store-orders", filterStatus, page],
    queryFn: async () => {
      const params = new URLSearchParams({ 
        status: filterStatus,
        page: page.toString(),
        limit: "10"
      });
      const { data } = await api.get(`/store-orders/admin?${params.toString()}`);
      return data;
    },
  });

  const orders = response?.data || [];
  const pagination = response?.pagination;

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/store-orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-store-orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  // These stats are usually calculated from a separate stats endpoint or are global.
  // For now, keeping them derived from the current view or placeholder.
  const stats = {
    total: pagination?.total || 0,
    revenue: orders?.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0) || 0,
  };

  return (
    <div className="p-3 md:p-4 space-y-4 bg-background min-h-screen">
      <PortalPageHeader
        title="Store Orders"
        icon={ShoppingBag}
        subtitle="Operational stream for provisioned store transactions."
        badge={
          <Badge className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md italic">
            {pagination?.total ?? 0} TRANSACTIONS
          </Badge>
        }
        actions={
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="w-40 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest italic border-border shadow-sm">
              <SelectValue placeholder="STATUS FILTER" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border shadow-2xl">
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Orders</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize text-[10px] font-black uppercase tracking-widest">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Total Orders"
          value={stats.total}
          icon={Package}
          subtext="Processed in system"
          index={0}
        />
        <PortalStatCard
          label="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          icon={ShoppingBag}
          subtext="Net value"
          index={1}
          iconClass="icon-revenue"
        />
      </div>

      <PortalGrid
        data={orders}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        columns={1}
        renderItem={(order: any) => (
          <div
            key={order._id}
            className="bg-card/40 rounded-xl border border-border/50 shadow-sm overflow-hidden hover:border-primary/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 p-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black italic uppercase text-xs tracking-tight truncate max-w-[200px] text-foreground group-hover:text-primary transition-colors">
                    {order.storeName}
                  </p>
                  <span className="text-[7px] text-muted-foreground/30 font-black uppercase tracking-widest leading-none">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <p className="text-[9px] font-black text-muted-foreground/40 mt-1 italic truncate uppercase tracking-widest">
                  {order.customer.name} · {order.customer.phone} · {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-black italic text-[14px] tabular-nums text-foreground/80">
                  ₹{order.totalAmount.toLocaleString()}
                </span>
                <Select
                  value={order.status}
                  onValueChange={(val) => updateStatus.mutate({ id: order._id, status: val })}
                >
                  <SelectTrigger className={`w-32 h-8 rounded-lg border text-[9px] font-black uppercase tracking-widest capitalize shadow-sm ${STATUS_STYLES[order.status] || ""}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border shadow-2xl">
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize text-[9px] font-black uppercase tracking-widest">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  className="h-8 w-8 rounded-lg bg-muted/20 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors border border-border/10"
                >
                  {expanded === order._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Expanded details */}
            {expanded === order._id && (
              <div className="border-t border-border/20 bg-muted/5 p-4 space-y-5 animate-in slide-in-from-top-2 duration-300">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer */}
                  <div className="space-y-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/40 italic">Registry Node</p>
                    <div className="space-y-2 text-[11px] font-black italic text-foreground/70 uppercase tracking-tighter">
                      <p className="text-[12px] font-black text-foreground">{order.customer.name}</p>
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-3.5 w-3.5 text-primary/30" />
                        <span className="truncate">{order.customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="h-3.5 w-3.5 text-primary/30" />
                        <span>{order.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-3.5 w-3.5 text-primary/30" />
                        <span className="leading-tight">{order.customer.address}</span>
                      </div>
                      {order.notes && (
                        <div className="mt-3 p-2.5 bg-primary/5 border-l-2 border-primary/30 rounded-r-lg">
                          <p className="text-[9px] font-black opacity-60">LOG: {order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/40 italic">Asset Payload</p>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => {
                        const finalPrice = item.price * (1 - (item.discountPercent || 0) / 100);
                        return (
                          <div key={idx} className="flex items-center justify-between text-[11px] font-black italic uppercase tracking-tighter">
                            <div className="flex items-center gap-2.5">
                              {item.image && <img src={item.image} alt={item.name} className="h-8 w-8 rounded-lg object-cover border border-border/50" />}
                              <span className="text-foreground/80">{item.name} <span className="text-primary/40 text-[9px]">×{item.quantity}</span></span>
                            </div>
                            <span className="font-black tabular-nums text-foreground/70">₹{(finalPrice * item.quantity).toLocaleString()}</span>
                          </div>
                        );
                      })}
                      <div className="pt-3 mt-3 border-t border-border/20 flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
                          {order.paymentMethod === "cod" ? "COD TRANSACTION" : "ONLINE PROTOCOL"}
                        </span>
                        <span className="text-[15px] font-black italic tabular-nums text-primary">
                          ₹{order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        emptyMessage="No Orders Detected in current sector."
      />
    </div>
  );
};

export default StoreOrdersPage;
