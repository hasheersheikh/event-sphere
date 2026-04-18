import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  Ticket,
  Calendar,
  Briefcase,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Clock,
  ChevronRight,
  Landmark,
  QrCode,
  LayoutDashboard,
  Receipt,
  Settings2,
  Users,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";

const ManagerDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [commData, setCommData] = useState({ type: "percentage", value: 10 });

  useEffect(() => {
    fetchManagerDetail();
  }, [id]);

  useEffect(() => {
    if (data?.manager) {
      setCommData({
        type: data.manager.commissionType || "percentage",
        value: data.manager.commissionValue ?? 10,
      });
    }
  }, [data]);

  const fetchManagerDetail = async () => {
    try {
      const response = await api.get(`/admin/managers/${id}`);
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load manager details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayout = async () => {
    const amt = Number(payoutAmount);
    if (!payoutAmount || isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid payout amount.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await api.post(`/admin/managers/${id}/payout`, {
        amount: amt,
        notes: "Manual payout by admin",
      });
      toast.success(res.data.message || "Payout initiated via Razorpay.");
      setIsPayoutModalOpen(false);
      setPayoutAmount("");
      fetchManagerDetail();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Payout failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCommission = async () => {
    setIsProcessing(true);
    try {
      await api.patch(`/admin/managers/${id}/commission`, {
        commissionType: commData.type,
        commissionValue: commData.value,
      });
      toast.success("Commission protocol synchronized.");
      setIsCommissionModalOpen(false);
      fetchManagerDetail();
    } catch (error) {
      toast.error("Failed to update commission parameters.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-[11px] font-black uppercase text-primary tracking-[0.5em] animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { manager, stats, events, payouts } = data;

  return (
    <div className="space-y-4 min-h-screen bg-background p-3 md:p-4">
      <header className="flex flex-col gap-4">
        <Link
          to="/portal/admin/managers"
          className="inline-flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Return to Registry
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2 text-primary uppercase tracking-[0.3em] font-black text-[9px]">
              <Briefcase className="h-3.5 w-3.5" />
              Operational Commander Detail
            </div>
            <h1 className="text-xl md:text-2xl font-black brand-font tracking-tight uppercase leading-none text-foreground italic shadow-sm">
              {manager.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2.5">
              <p className="text-muted-foreground font-bold italic text-xs">
                {manager.email}
              </p>
              <div className="h-1 w-1 rounded-full bg-border" />
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                ID: {manager._id.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </header>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-lg border border-border/50 mb-4 w-full md:w-auto h-auto flex-wrap">
          <TabsTrigger
            value="dashboard"
            className="rounded-md px-4 py-1.5 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2"
          >
            <LayoutDashboard className="h-3 w-3" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="rounded-md px-4 py-1.5 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2"
          >
            <Calendar className="h-3 w-3" />
            Event Matrix
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="rounded-md px-4 py-1.5 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2"
          >
            <Receipt className="h-3 w-3" />
            Capital & Settlements
          </TabsTrigger>
          <TabsTrigger
            value="volunteers"
            className="rounded-md px-4 py-1.5 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2"
          >
            <Users className="h-3 w-3" />
            Operational Units
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-3.5 rounded-lg relative overflow-hidden group shadow-lg shadow-black/5">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
              <div className="flex justify-between items-start mb-2.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                  Gross Revenue
                </p>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-black tabular-nums text-foreground italic">
                ₹{stats.totalRevenue.toLocaleString()}
              </h2>
            </div>

            <div className="bg-card border border-border p-3.5 rounded-lg relative overflow-hidden group shadow-lg shadow-black/5">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-lg shadow-blue-500/20" />
              <div className="flex justify-between items-start mb-2.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                  Total Reach
                </p>
                <Ticket className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <h2 className="text-xl font-black tabular-nums text-foreground italic">
                {stats.totalTicketsSold.toLocaleString()}
                <span className="text-[9px] ml-1.5 text-muted-foreground uppercase tracking-widest opacity-60">
                  Tickets
                </span>
              </h2>
            </div>

            <div className="bg-card border border-border p-3.5 rounded-lg relative overflow-hidden group shadow-lg border-primary/20 bg-primary/5 shadow-black/5">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-lg shadow-primary/20" />
              <div className="flex justify-between items-start mb-2.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">
                  Net Liability
                </p>
                <DollarSign className="h-3.5 w-3.5 text-primary" />
              </div>
              <h2 className="text-xl font-black tabular-nums text-primary underline decoration-primary/20 underline-offset-4 italic">
                ₹{stats.pendingPayout.toLocaleString()}
              </h2>
            </div>

            <div className="bg-card border border-border p-3.5 rounded-lg relative overflow-hidden group shadow-lg shadow-black/5">
              <div className="absolute top-0 left-0 w-1 h-full bg-zinc-500 shadow-lg" />
              <div className="flex justify-between items-start mb-2.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                  Active Units
                </p>
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              </div>
              <h2 className="text-xl font-black tabular-nums text-foreground italic">
                {stats.totalEvents}
                <span className="text-[9px] ml-1.5 text-muted-foreground uppercase tracking-widest opacity-60">
                  Events
                </span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settlement Destination */}
            <section className="bg-card border border-border overflow-hidden rounded-lg shadow-xl shadow-black/5">
              <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2.5 text-foreground italic">
                  <Landmark className="h-3.5 w-3.5 text-primary" />
                  Primary Settlement Channel
                </h3>
                {manager.bankDetails && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none rounded-md text-[8px] font-black uppercase tracking-widest italic px-1.5 py-0.5">
                    Verified
                  </Badge>
                )}
              </div>
              <div className="p-4 space-y-4">
                {manager.bankDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest">
                        Beneficiary Name
                      </p>
                      <p className="text-[11px] font-black text-foreground italic">
                        {manager.bankDetails.accountHolder}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest">
                        Channel Identifier
                      </p>
                      <p className="text-[11px] font-black text-foreground font-mono">
                        {manager.bankDetails.accountNumber}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest">
                        Financial Institution
                      </p>
                      <p className="text-[11px] font-black text-foreground italic">
                        {manager.bankDetails.bankName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-muted-foreground/50 tracking-widest">
                        Protocol Code (IFSC)
                      </p>
                      <p className="text-[11px] font-black text-foreground uppercase font-mono">
                        {manager.bankDetails.ifscCode}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">
                      No bank credentials recorded.
                    </p>
                  </div>
                )}

                <div className="h-px bg-border/50" />

                <div className="bg-muted/20 p-4 rounded-lg border border-border/50 group hover:border-primary/30 transition-all">
                  <p className="text-[8px] font-black uppercase text-primary mb-2.5 flex items-center gap-2.5 italic">
                    <QrCode className="h-3.5 w-3.5" />
                    Direct Frequency (UPI)
                  </p>
                  {manager.upiId ? (
                    <p className="text-lg font-black text-foreground italic tracking-tight uppercase group-hover:text-primary transition-colors">
                      {manager.upiId}
                    </p>
                  ) : (
                    <p className="text-[10px] font-medium text-muted-foreground italic">
                      No UPI ID registered.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-card border border-border p-4 rounded-lg shadow-xl shadow-black/5 flex flex-col justify-center gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] scale-[2.5] rotate-12 pointer-events-none text-primary">
                <ShieldCheck className="w-16 h-16" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase brand-font tracking-tight italic">
                  Administrative <span className="text-primary">Control.</span>
                </h3>
                <p className="text-muted-foreground font-semibold text-xs max-w-sm opacity-70">
                  Execute settlements or modify the revenue sharing deal for
                  this operation unit.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog
                  open={isCommissionModalOpen}
                  onOpenChange={setIsCommissionModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 h-11 border-border bg-muted/20 text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-muted/40 transition-all gap-2.5"
                    >
                      <Settings2 className="h-4 w-4" />
                      Configure Deal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-border rounded-xl p-6 sm:max-w-md shadow-3xl">
                    <DialogHeader className="mb-8">
                      <DialogTitle className="text-2xl font-black brand-font uppercase tracking-tighter italic">
                        Platform <span className="text-primary">Deal.</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
                          Transaction Model
                        </label>
                        <div className="grid grid-cols-2 gap-2.5 p-1 bg-muted/30 rounded-xl border border-border">
                          <button
                            onClick={() =>
                              setCommData({ ...commData, type: "percentage" })
                            }
                            className={`py-3 px-5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${commData.type === "percentage" ? "bg-background shadow-lg text-primary border-none" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            Percentage
                          </button>
                          <button
                            onClick={() =>
                              setCommData({ ...commData, type: "flat" })
                            }
                            className={`py-3 px-5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${commData.type === "flat" ? "bg-background shadow-lg text-primary border-none" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            Flat Fee
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
                          Magnitude (
                          {commData.type === "percentage" ? "%" : "INR"})
                        </label>
                        <input
                          type="number"
                          value={commData.value}
                          onChange={(e) =>
                            setCommData({
                              ...commData,
                              value: Number(e.target.value),
                            })
                          }
                          className="w-full h-11 bg-muted/20 border-2 border-border px-5 text-xl font-black text-foreground focus:outline-none focus:border-primary/50 rounded-xl transition-all shadow-inner"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => setIsCommissionModalOpen(false)}
                          variant="ghost"
                          className="flex-1 h-12 rounded-lg text-[10px] font-black uppercase"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateCommission}
                          disabled={isProcessing}
                          className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-[10px] font-black uppercase shadow-2xl border-none"
                        >
                          {isProcessing ? "SYNCING..." : "SAVE DEAL"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isPayoutModalOpen}
                  onOpenChange={setIsPayoutModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="flex-1 h-11 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all gap-2.5 border-none">
                      <DollarSign className="h-4 w-4" />
                      Send Payout
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-border rounded-xl p-6 sm:max-w-md shadow-3xl">
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-2xl font-black brand-font uppercase tracking-tighter italic">
                        Send <span className="text-emerald-500">Payout</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Payment method warning */}
                      {!manager.bankDetails?.accountNumber &&
                        !manager.upiId && (
                          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                              This manager has not configured a bank account or
                              UPI ID. Payout will fail until they add payment
                              details.
                            </p>
                          </div>
                        )}

                      {/* Via info */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border rounded-xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          Via
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                          {manager.upiId && !manager.bankDetails?.accountNumber
                            ? `UPI — ${manager.upiId}`
                            : manager.bankDetails?.accountNumber
                              ? `Bank — ••••${manager.bankDetails.accountNumber.slice(-4)}`
                              : "No payment method set"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-muted/20 rounded-xl border border-border">
                          <p className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">
                            Available
                          </p>
                          <p className="text-lg font-black text-foreground italic">
                            ₹{Math.floor(stats.pendingPayout).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                          <p className="text-[8px] font-black text-emerald-500 uppercase mb-0.5">
                            Already Paid
                          </p>
                          <p className="text-lg font-black text-emerald-500 italic">
                            ₹{(stats.totalPaid || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
                          Amount (INR)
                        </label>
                        <input
                          type="number"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder="0.00"
                          max={Math.floor(stats.pendingPayout)}
                          min={1}
                          className="w-full h-10 bg-muted/20 border-2 border-border px-5 text-xl font-black text-emerald-500 focus:outline-none focus:border-emerald-500/50 rounded-xl transition-all shadow-inner"
                        />
                        <p className="text-[9px] text-muted-foreground font-medium ml-1">
                          Payout will be sent via Razorpay. Status updates
                          automatically.
                        </p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => setIsPayoutModalOpen(false)}
                          variant="ghost"
                          className="flex-1 h-12 rounded-lg text-[10px] font-black uppercase"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePayout}
                          disabled={
                            isProcessing ||
                            (!manager.bankDetails?.accountNumber &&
                              !manager.upiId)
                          }
                          className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase shadow-2xl border-none disabled:opacity-50"
                        >
                          {isProcessing ? "Sending..." : "Send via Razorpay"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-10">
          <section className="bg-card border border-border overflow-hidden rounded-xl shadow-xl">
            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                Operational Event Matrix
              </h3>
              <div className="text-[9px] font-black uppercase text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border/50">
                {events.length} Deployments
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] border-b border-border">
                    <th className="px-6 py-4">Event Signature</th>
                    <th className="px-6 py-4">Timeline</th>
                    <th className="px-6 py-4">Scale</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Revenue Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {events.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-8 py-24 text-center font-black uppercase text-[10px] tracking-widest text-muted-foreground opacity-50 italic"
                      >
                        No operational deployments detected.
                      </td>
                    </tr>
                  ) : (
                    events.map((e: any, index: number) => (
                      <motion.tr
                        key={e._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navigate(`/events/${e._id}`)}
                        className="hover:bg-muted/20 transition-all group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <p className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                            {e.title}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-black text-muted-foreground tabular-nums uppercase">
                          {new Date(e.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-foreground">
                              {e.ticketsSold.toLocaleString()} SOLD
                            </span>
                            <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: "65%" }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border-none ${
                              e.status === "published"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : e.status === "sold_out"
                                  ? "bg-rose-500/10 text-rose-500"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {e.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-black tabular-nums text-foreground text-sm italic">
                          ₹{e.revenue.toLocaleString()}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settlement History */}
            <section className="lg:col-span-2 bg-card border border-border overflow-hidden rounded-xl shadow-xl h-full">
              <div className="p-6 border-b border-border bg-muted/20">
                <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-4 text-foreground">
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                  Historical Settlement Log
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {!payouts || payouts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 opacity-30 italic">
                    <Receipt className="h-12 w-12" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                      No settlements detected.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {payouts.map((p: any) => (
                      <div
                        key={p._id}
                        className="p-4 bg-muted/10 border border-border/50 rounded-xl flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                              p.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : p.status === "processing"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : p.status === "failed"
                                    ? "bg-rose-500/10 text-rose-500"
                                    : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <Badge
                                className={`text-[8px] font-black uppercase tracking-widest border-none px-2 py-0.5 ${
                                  p.status === "completed"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : p.status === "processing"
                                      ? "bg-blue-500/10 text-blue-500"
                                      : p.status === "failed"
                                        ? "bg-rose-500/10 text-rose-500"
                                        : "bg-amber-500/10 text-amber-500"
                                }`}
                              >
                                {p.status}
                              </Badge>
                              {p.razorpayPayoutId && (
                                <span className="text-[8px] font-mono text-muted-foreground/50">
                                  {p.razorpayPayoutId}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase opacity-80">
                              {new Date(p.createdAt).toLocaleDateString()} ·{" "}
                              {p.notes || "Payout"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-foreground tabular-nums tracking-tighter">
                            ₹{p.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Deal Architecture */}
            <section className="bg-card border border-border overflow-hidden rounded-xl shadow-xl h-auto">
              <div className="p-6 border-b border-border bg-primary/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-4 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Core Deal Architecture
                </h3>
              </div>
              <div className="p-5 space-y-6">
                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest border-l-3 border-primary pl-3">
                    Platform Entitlement
                  </p>
                  <div className="space-y-3 bg-muted/20 p-5 rounded-xl border border-border">
                    <div className="flex justify-between items-center text-primary">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                        Status
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Synchronized
                      </span>
                    </div>
                    <div className="text-2xl font-black italic tracking-tighter text-foreground">
                      {manager.commissionValue}
                      <span className="text-lg ml-1 opacity-40">
                        {manager.commissionType === "percentage"
                          ? "%"
                          : " FLAT"}
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-muted-foreground italic leading-relaxed">
                      Platform share deduction applied to ticket sales.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-zinc-950 rounded-xl border border-white/5 space-y-3 dark:bg-muted/10">
                  <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                    Lifetime Net Earnings
                  </p>
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-2xl font-black text-white tabular-nums">
                      ₹{stats.netDue.toLocaleString()}
                    </h4>
                    <TrendIcon value={12} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="volunteers" className="space-y-10">
          <section className="bg-card border border-border overflow-hidden rounded-xl shadow-xl">
            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground">
                <Users className="h-4 w-4 text-primary" />
                Operational Units (Volunteers)
              </h3>
              <div className="text-[9px] font-black uppercase text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border/50">
                {data.volunteers?.length || 0} Ground Personnel
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] border-b border-border">
                    <th className="px-8 py-6">Identity Signature</th>
                    <th className="px-8 py-6">Deployment Target</th>
                    <th className="px-8 py-6">Access Point</th>
                    <th className="px-8 py-6 text-right">Registry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {!data.volunteers || data.volunteers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-8 py-24 text-center font-black uppercase text-[10px] tracking-widest text-muted-foreground opacity-50 italic"
                      >
                        No operational ground personnel detected.
                      </td>
                    </tr>
                  ) : (
                    data.volunteers.map((v: any, index: number) => (
                      <motion.tr
                        key={v._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/10 transition-all group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                              {v.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-sm uppercase tracking-tight text-foreground">
                                {v.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-bold italic opacity-70">
                                {v.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase">
                          {v.event?.title || "UNASSIGNED"}
                        </td>
                        <td className="px-8 py-6">
                          <Badge
                            variant="outline"
                            className="rounded-lg border-primary/20 text-primary bg-primary/5 font-black uppercase text-[9px]"
                          >
                            {v.gate || "DEFAULT"}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right text-[10px] font-black text-muted-foreground tabular-nums">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TrendIcon = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm">
    <TrendingUp className="h-4 w-4" />
    <span className="text-[11px] font-black font-mono">+{value}%</span>
  </div>
);

export default ManagerDetailPage;
