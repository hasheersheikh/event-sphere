import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wallet,
  TrendingUp,
  History,
  IndianRupee,
  CreditCard,
  QrCode,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { PortalDataTable } from "@/components/portal/PortalDataTable";

const PayoutsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [payoutForm, setPayoutForm] = useState({
    upiId: "",
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      accountHolderName: "",
    },
  });

  const { data: response, isLoading: payoutsLoading } = useQuery({
    queryKey: ["manager-payouts", page],
    queryFn: async () => {
      const { data } = await api.get(`/manager/payouts?page=${page}&limit=10`);
      return data;
    },
  });

  const payouts = response?.data || [];
  const pagination = response?.pagination;

  const { data: stats } = useQuery({
    queryKey: ["manager-payout-stats"],
    queryFn: async () => {
      const { data } = await api.get("/manager/stats");
      return data;
    },
  });

  const { data: details } = useQuery({
    queryKey: ["manager-payout-details"],
    queryFn: async () => {
      const { data } = await api.get("/manager/payout-details");
      return data;
    },
  });

  useEffect(() => {
    if (details) {
      setPayoutForm({
        upiId: details.upiId || "",
        bankDetails: {
          accountNumber: details.bankDetails?.accountNumber || "",
          ifscCode: details.bankDetails?.ifscCode || "",
          bankName: details.bankDetails?.bankName || "",
          accountHolderName: details.bankDetails?.accountHolderName || "",
        },
      });
    }
  }, [details]);

  const updateDetailsMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data } = await api.patch("/manager/payout-details", values);
      return data;
    },
    onSuccess: () => {
      toast.success("Payout protocols updated.");
      queryClient.invalidateQueries({ queryKey: ["manager-payout-details"] });
    },
    onError: () => {
      toast.error("Failed to update payout protocols.");
    },
  });

  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetailsMutation.mutate(payoutForm);
  };

  const columns = [
    {
      header: "Timestamp",
      accessor: (p: any) => (
        <div className="flex flex-col">
          <span className="font-black text-[11px] uppercase italic">
            {new Date(p.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
            {new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      ),
    },
    {
      header: "Ref ID",
      accessor: (p: any) => (
        <span className="font-mono text-[9px] text-primary font-black uppercase tracking-tight italic">
          {p.referenceId || "TXN-" + p._id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (p: any) => (
        <Badge
          className={`rounded-lg px-2 py-0.5 text-[7px] font-black uppercase tracking-widest italic ${
            p.status === "completed"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : p.status === "processing"
                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                : p.status === "pending"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
          }`}
        >
          {p.status}
        </Badge>
      ),
    },
    {
      header: "Amount",
      headerClassName: "text-right",
      accessor: (p: any) => (
        <div className="text-right font-black italic text-sm tabular-nums">
          ₹{p.amount.toLocaleString()}
        </div>
      ),
    },
  ];

  return (
    <div className="p-3 md:p-4 space-y-4 bg-background min-h-screen">
      <PortalPageHeader
        title="Payout Protocol"
        icon={Wallet}
        subtitle="Tactical overview of verified asset settlements and liquidity."
      />

      <section>
        <div className="bg-card/40 border border-border/50 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <ShieldCheck className="h-24 w-24 text-primary" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest italic">
                <ShieldCheck className="h-3.5 w-3.5" />
                Settlement Governance
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase italic leading-tight text-foreground">
                Revenue & <span className="text-primary">Fees.</span>
              </h2>
              <p className="text-muted-foreground text-[11px] leading-relaxed font-black italic uppercase tracking-widest opacity-60">
                Pulse operates on a transparent{" "}
                {details?.commissionType === "percentage"
                  ? `flat ${details?.commissionValue || 5}% service fee`
                  : `₹${details?.commissionValue || 0} flat fee`}{" "}
                per transaction. Payouts processed on a {details?.payoutCycle || "T+2"}{" "}
                cycle basis.
              </p>
            </div>
            <div className="flex gap-10 shrink-0 border-l border-border/20 pl-10 hidden md:flex">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1 leading-none">FEE</p>
                <p className="text-2xl font-black text-foreground italic uppercase tabular-nums">
                  {details?.commissionType === "percentage"
                    ? `${details?.commissionValue || 5}%`
                    : `₹${details?.commissionValue || 0}`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1 leading-none">CYCLE</p>
                <p className="text-2xl font-black text-foreground italic uppercase tabular-nums">
                  {details?.payoutCycle || "T+2"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PortalStatCard
          label="Total Earned"
          value={`₹${(stats?.netDue || 0).toLocaleString()}`}
          icon={TrendingUp}
          subtext="Net earnings"
          index={0}
          iconClass="icon-revenue"
        />
        <PortalStatCard
          label="Withdrawn"
          value={`₹${(stats?.totalSettled || 0).toLocaleString()}`}
          icon={Wallet}
          subtext="Settled assets"
          index={1}
        />
        <PortalStatCard
          label="In Pipeline"
          value={`₹${(stats?.pendingPayout || 0).toLocaleString()}`}
          icon={IndianRupee}
          subtext="Available for withdrawal"
          index={2}
          iconClass="icon-revenue"
        />
        <PortalStatCard
          label="Method"
          value={details?.upiId ? "UPI" : details?.bankDetails?.accountNumber ? "BANK" : "NONE"}
          icon={CreditCard}
          subtext="Settlement portal"
          index={3}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1">
          <div className="bg-card/40 rounded-2xl border border-border/50 p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-tight italic">
                Vault Configuration
              </h2>
            </div>

            <form onSubmit={handleUpdateDetails} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  UPI Identity
                </label>
                <div className="relative">
                  <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                  <Input
                    placeholder="VIBE@UPI"
                    value={payoutForm.upiId}
                    onChange={(e) =>
                      setPayoutForm({ ...payoutForm, upiId: e.target.value })
                    }
                    className="h-10 pl-10 bg-muted/20 border-border rounded-xl font-black text-xs uppercase italic tracking-widest italic"
                  />
                </div>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em] text-muted-foreground/20 bg-card px-3 italic">
                  OR CORE BANKING
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                    Account Serial
                  </label>
                  <Input
                    value={payoutForm.bankDetails.accountNumber}
                    onChange={(e) =>
                      setPayoutForm({
                        ...payoutForm,
                        bankDetails: {
                          ...payoutForm.bankDetails,
                          accountNumber: e.target.value,
                        },
                      })
                    }
                    className="h-10 bg-muted/20 border-border rounded-xl font-black text-xs italic tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                      IFSC
                    </label>
                    <Input
                      value={payoutForm.bankDetails.ifscCode}
                      onChange={(e) =>
                        setPayoutForm({
                          ...payoutForm,
                          bankDetails: {
                            ...payoutForm.bankDetails,
                            ifscCode: e.target.value,
                          },
                        })
                      }
                      className="h-10 bg-muted/20 border-border rounded-xl font-black text-xs uppercase italic tracking-widest"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                      Protocol
                    </label>
                    <Input
                      value={payoutForm.bankDetails.bankName}
                      onChange={(e) =>
                        setPayoutForm({
                          ...payoutForm,
                          bankDetails: {
                            ...payoutForm.bankDetails,
                            bankName: e.target.value,
                          },
                        })
                      }
                      placeholder="HD-01..."
                      className="h-10 bg-muted/20 border-border rounded-xl font-black text-xs uppercase italic tracking-widest"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateDetailsMutation.isPending}
                className="w-full h-11 bg-primary text-black rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all border-none italic"
              >
                <Save className="h-4 w-4 mr-2" />
                Initialize Vault Update
              </Button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="bg-card/40 rounded-2xl border border-border/50 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-tight italic">
                  Asset Ledger
                </h2>
              </div>
            </div>

            <PortalDataTable
              columns={columns}
              data={payouts}
              isLoading={payoutsLoading}
              pagination={pagination}
              onPageChange={setPage}
              searchPlaceholder="SEARCH BY REF ID..."
              rowKey="_id"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default PayoutsPage;
