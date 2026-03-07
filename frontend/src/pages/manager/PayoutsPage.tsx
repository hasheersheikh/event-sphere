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
} from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <Navbar />
      <main className="flex-1 container py-12 md:py-20 z-10">
        <header className="mb-16">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 glass-panel text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-6 rounded-full border border-emerald-500/20">
            <IndianRupee className="h-3 w-3" />
            Financial Center
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 uppercase italic">
            Payout <span className="text-emerald-500">History.</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl">
            Track your production settlements and financial performance in
            real-time.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {cards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-[2.5rem] p-8 flex items-center gap-8 border border-border/50 shadow-xl"
            >
              <div
                className={`h-20 w-20 rounded-[1.5rem] ${card.bg} flex items-center justify-center shrink-0 border border-border/10`}
              >
                <card.icon className={`h-10 w-10 ${card.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  {card.label}
                </p>
                <p className="text-3xl font-black tracking-tighter">
                  {card.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* History Table */}
        <section className="glass-card rounded-[3rem] border border-border/50 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-border/50 flex justify-between items-center bg-muted/5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <History className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Recent Settlements
              </h2>
            </div>
            <Badge
              variant="outline"
              className="rounded-full px-6 py-2 font-black text-[10px] uppercase tracking-[0.2em]"
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
                      className="px-10 py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                    >
                      Synchronizing ledger...
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
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            {new Date(payout.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                            {new Date(payout.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8 font-mono text-[10px] text-emerald-500 font-bold uppercase">
                        {payout.referenceId || "TXN-MAN-00" + index}
                      </td>
                      <td className="px-10 py-8">
                        <Badge
                          className={`rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-widest ${
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
                      <td className="px-10 py-8 text-right font-black text-lg">
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
      </main>
      <Footer />
    </div>
  );
};

export default PayoutsPage;
