import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Store, MapPin, Package, ChevronRight,
  ToggleLeft, ToggleRight, Edit3,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LocalStore {
  _id: string;
  name: string;
  address: string;
  category: string;
  photos: string[];
  products: { _id: string }[];
  isActive: boolean;
  paymentMethods?: string[];
  contactPhone?: string;
}

// ── Store Row ────────────────────────────────────────────────────────────────
const StoreRow = ({ store }: { store: LocalStore }) => {
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/local-stores/${store._id}`),
    onSuccess: () => {
      toast.success("Store deleted.");
      qc.invalidateQueries({ queryKey: ["adminLocalStores"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: () => api.patch(`/local-stores/${store._id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminLocalStores"] }),
  });

  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden bg-card hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-4 p-5">
        {/* Cover photo */}
        <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {store.photos[0] ? (
            <img src={store.photos[0]} alt={store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="h-6 w-6 text-muted-foreground/40" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-black truncate">{store.name}</p>
            <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
              {store.category}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground truncate">{store.address}</p>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> {store.products.length} products
            </span>
            {store.paymentMethods && store.paymentMethods.length > 0 && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {store.paymentMethods.join(" · ")}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => toggleMutation.mutate()}
            className={cn("h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
              store.isActive
                ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "text-muted-foreground bg-muted hover:bg-muted/80"
            )}
            title={store.isActive ? "Deactivate" : "Activate"}
          >
            {store.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
          <Link
            to={`/portal/admin/local-stores/${store._id}/edit`}
            className="h-8 w-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => { if (confirm("Delete this store?")) deleteMutation.mutate(); }}
            className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <Link
            to={`/portal/admin/local-stores/${store._id}`}
            className="h-8 px-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            View <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const LocalStoresPage = () => {
  const navigate = useNavigate();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["adminLocalStores"],
    queryFn: async () => {
      const { data } = await api.get("/local-stores/admin/all");
      return data as LocalStore[];
    },
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-6 bg-amber-400 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Admin Panel</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">
            <span className="text-amber-400">Stores</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage stores displayed on the homepage.</p>
        </div>
        <Button
          type="button"
          onClick={() => navigate("/portal/admin/local-stores/new")}
          className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary gap-2"
        >
          <Plus className="h-4 w-4" /> Add Store
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Stores", value: stores?.length ?? "—", color: "text-primary" },
          { label: "Active", value: stores?.filter(s => s.isActive).length ?? "—", color: "text-emerald-500" },
          { label: "Total Products", value: stores?.reduce((a, s) => a + s.products.length, 0) ?? "—", color: "text-amber-500" },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl bg-card border border-border/60">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stores list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !stores?.length ? (
        <div className="py-20 text-center border border-dashed border-border rounded-3xl">
          <Store className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No stores yet</p>
          <p className="text-xs text-muted-foreground/60 mt-2">Click "Add Store" to create your first local store.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stores.map((store) => (
            <StoreRow key={store._id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LocalStoresPage;
