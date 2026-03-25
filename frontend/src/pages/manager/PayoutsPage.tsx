import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  History,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowRight,
  IndianRupee,
  Building,
  CreditCard,
  QrCode,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const PayoutsPage = () => {
  const { user } = useAuth();

  const { data: payouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ["manager-payouts"],
    queryFn: async () => {
      const { data } = await api.get("/manager/payouts");
      return data;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["manager-payout-stats"],
    queryFn: async () => {
      const { data } = await api.get("/manager/stats"); // Existing endpoint for revenue
      return data;
    },
  });

  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ["manager-payout-details"],
    queryFn: async () => {
      const { data } = await api.get("/manager/payout-details");
      return data;
    },
  });

  const queryClient = useQueryClient();
  const [payoutForm, setPayoutForm] = useState({
    upiId: "",
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      accountHolderName: "",
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

  const totalPaid =
    payouts?.reduce(
      (acc: number, p: any) => acc + (p.status === "completed" ? p.amount : 0),
      0,
    ) || 0;
  const grossRevenue = stats?.totalRevenue || 0;
  // Note: Backend might need to calculate net due based on commission,
  // but for now we'll show gross and total paid.

  const cards = [
    {
      label: "Total Earned",
      value: `₹${grossRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Withdrawn",
      value: `₹${totalPaid.toLocaleString()}`,
      icon: Wallet,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Settlement Method",
      value: details?.upiId
        ? "UPI Active"
        : details?.bankDetails?.accountNumber
          ? "Bank Active"
          : "Not Configured",
      icon: CheckCircle2,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-12 bg-background text-foreground">
      <main className="z-10">
        {/* Governance & Fees Alert */}
        <section className="mb-8">
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="h-24 w-24 text-primary" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-3 max-w-2xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" />
                  Protocol Security
                </div>
                <h2 className="text-xl font-black tracking-tight uppercase italic">
                  Governance & <span className="text-primary">Fees.</span>
                </h2>
                <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                  Pulse operates on a transparent {details?.commissionType === 'percentage' ? `flat ${details?.commissionValue || 5}% service fee` : `₹${details?.commissionValue || 0} flat fee`} per transaction to maintain network security and real-time ledger synchronization. Payouts are reconciled on a {details?.payoutCycle || 'T+2'} basis.
                </p>
              </div>
              <div className="flex gap-10 shrink-0 border-l border-border pl-10 hidden md:flex">
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Fee</p>
                  <p className="text-2xl font-black text-foreground italic uppercase">
                    {details?.commissionType === 'percentage' ? `${details?.commissionValue || 5}%` : `₹${details?.commissionValue || 0}`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Cycle</p>
                  <p className="text-2xl font-black text-foreground italic uppercase">{details?.payoutCycle || 'T+2'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {cards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-[2rem] p-6 flex items-center gap-6 border border-border/50 shadow-lg"
            >
              <div
                className={`h-16 w-16 rounded-[1.2rem] ${card.bg} flex items-center justify-center shrink-0 border border-border/10`}
              >
                <card.icon className={`h-8 w-8 ${card.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {card.label}
                </p>
                <p className="text-2xl font-black tracking-tighter">
                  {card.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Payout Configuration */}
          <section className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-[2.5rem] border border-border/50 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-tight">
                  Payout Method
                </h2>
              </div>

              <form onSubmit={handleUpdateDetails} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    UPI ID (Preferred)
                  </label>
                  <div className="relative">
                    <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                    <Input
                      placeholder="vibe@upi"
                      value={payoutForm.upiId}
                      onChange={(e) =>
                        setPayoutForm({ ...payoutForm, upiId: e.target.value })
                      }
                      className="h-12 pl-12 bg-muted/30 border-border rounded-xl font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/30 bg-card px-2">
                    OR BANK
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Account Number
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
                      className="h-12 bg-muted/30 border-border rounded-xl font-bold text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
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
                        className="h-12 bg-muted/30 border-border rounded-xl font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Bank Name
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
                        className="h-12 bg-muted/30 border-border rounded-xl font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updateDetailsMutation.isPending}
                  className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Method
                </Button>
              </form>
            </div>
          </section>

          {/* History Table */}
          <section className="lg:col-span-2 glass-card rounded-[2.5rem] border border-border/50 overflow-hidden shadow-xl">
            <div className="p-8 border-b border-border/50 flex justify-between items-center bg-muted/5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  Ledger
                </h2>
              </div>
              <Badge
                variant="outline"
                className="rounded-full px-4 py-1.5 font-black text-[8px] uppercase tracking-[0.2em]"
              >
                {payouts?.length || 0} Transactions
              </Badge>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/10">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border/50">
                    Timestamp
                  </th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border/50">
                    Reference ID
                  </th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border/50">
                    Status
                  </th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border/50 text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {payoutsLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-12 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                    >
                      Ledger Sync...
                    </td>
                  </tr>
                ) : payouts?.length > 0 ? (
                  payouts.map((payout: any, index: number) => (
                    <motion.tr
                      key={payout._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-muted/5 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">
                            {new Date(payout.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                            {new Date(payout.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-[9px] text-emerald-500 font-bold uppercase tracking-tight">
                        {payout.referenceId || "TXN-MAN-00" + index}
                      </td>
                      <td className="px-8 py-6">
                        <Badge
                          className={`rounded-full px-3 py-0.5 text-[7px] font-black uppercase tracking-widest ${
                            payout.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : payout.status === "pending"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          }`}
                        >
                          {payout.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-base">
                        ₹{payout.amount.toLocaleString()}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
                          <Wallet className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black uppercase tracking-tight">
                            No Transactions
                          </h3>
                          <p className="text-muted-foreground font-medium text-sm">
                            Reach the payout threshold to see activity here.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
    </div>
  );
};

export default PayoutsPage;
