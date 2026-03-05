import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      toast.error("Frequency synchronization failed for manager identity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayout = async () => {
    if (!payoutAmount || isNaN(Number(payoutAmount))) {
      toast.error("Invalid payout magnitude.");
      return;
    }
    setIsProcessing(true);
    try {
      await api.post(`/admin/managers/${id}/payout`, {
        amount: Number(payoutAmount),
        notes: "Administrative Settlement",
      });
      toast.success("Settlement protocol initialized successfully.");
      setIsPayoutModalOpen(false);
      setPayoutAmount("");
      fetchManagerDetail();
    } catch (error) {
      toast.error("Payout transaction failure.");
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
      <div className="h-full min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.5em] animate-pulse">
          Decrypting Identity...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { manager, stats, events, payouts } = data;

  return (
    <div className="space-y-10 min-h-screen bg-zinc-950 p-6 md:p-10">
      <header className="flex flex-col gap-6">
        <Link
          to="/portal/admin/managers"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Registry
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4 text-emerald-400 uppercase tracking-[0.3em] font-black text-[10px]">
              <Briefcase className="h-4 w-4" />
              Manager Profile
            </div>
            <h1 className="text-6xl font-black brand-font tracking-tighter uppercase leading-none text-white">
              {manager.name}
            </h1>
            <p className="text-zinc-500 font-medium mt-4 italic">
              {manager.email} • IDENTITY: {manager._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setIsCommissionModalOpen(true)}
              className="border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest px-8 py-6 rounded-none hover:bg-white/10"
            >
              Configure Deal
            </Button>
            <Button
              onClick={() => setIsPayoutModalOpen(true)}
              className="bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-8 py-6 rounded-none shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:bg-emerald-400 transition-all"
            >
              Process Payout
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900/50 border border-white/5 p-8 relative overflow-hidden group backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
            Gross Revenue
          </p>
          <h2 className="text-3xl font-black tabular-nums text-white">
            ₹{stats.totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 p-8 relative overflow-hidden group backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
            Net Due (to Manager)
          </p>
          <h2 className="text-3xl font-black tabular-nums text-white">
            ₹{stats.netDue.toLocaleString()}
          </h2>
          <p className="text-[9px] font-bold text-zinc-600 mt-2 uppercase tracking-tighter">
            Platform Share: ₹{stats.totalCommission.toLocaleString()} (
            {manager.commissionValue}
            {manager.commissionType === "percentage" ? "%" : " FLAT"})
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-emerald-500/20 p-8 relative overflow-hidden group backdrop-blur-xl bg-emerald-500/5">
          <div className="absolute top-0 left-0 w-2 h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50 mb-2">
            Remaining Payout
          </p>
          <h2 className="text-3xl font-black tabular-nums text-orange-500">
            ₹{stats.pendingPayout.toLocaleString()}
          </h2>
          <p className="text-[9px] font-bold text-zinc-600 mt-2 uppercase tracking-tighter">
            Settled: ₹{(stats.totalPaid || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 p-8 relative overflow-hidden group backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-2 h-full bg-zinc-700" />
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
            Productions
          </p>
          <h2 className="text-3xl font-black tabular-nums text-white">
            {stats.totalEvents}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-zinc-900/50 border border-white/5 overflow-hidden backdrop-blur-xl">
            <div className="p-6 border-b border-white/5 bg-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-white">
                <Calendar className="h-4 w-4 text-emerald-500" />
                Production Inventory
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/60 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-8 py-6">Event Title</th>
                    <th className="px-8 py-6">Timeline</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-8 py-20 text-center font-black uppercase text-[10px] tracking-widest text-zinc-600"
                      >
                        No productions registered.
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
                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                      >
                        <td className="px-8 py-7">
                          <p className="font-black text-sm uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                            {e.title}
                          </p>
                          {!e.isApproved && (
                            <span className="text-[8px] font-black uppercase text-orange-500 bg-orange-500/10 px-2 py-0.5 mt-1 inline-block border border-orange-500/20">
                              Awaiting Moderation
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-7 text-[10px] font-black text-zinc-500 tabular-nums uppercase">
                          {new Date(e.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-8 py-7">
                          <Badge className="bg-white/5 text-zinc-400 border border-white/10 rounded-none text-[9px] font-black uppercase tracking-widest px-3 py-1">
                            {e.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-7 text-right font-black tabular-nums text-white">
                          ₹{e.revenue.toLocaleString()}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Payout History */}
        <div className="space-y-10">
          <section className="bg-zinc-900/50 border border-white/5 overflow-hidden backdrop-blur-xl h-full">
            <div className="p-6 border-b border-white/5 bg-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-white">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                Settlement History
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {!payouts || payouts.length === 0 ? (
                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest text-center py-10">
                  No previous settlements.
                </p>
              ) : (
                payouts.map((p: any) => (
                  <div
                    key={p._id}
                    className="p-4 bg-black/40 border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-colors"
                  >
                    <div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        Settled
                      </p>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-lg font-black text-white tabular-nums">
                      +₹{p.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Payout Modal Overlay */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-zinc-900 border border-white/10 p-10 space-y-8"
          >
            <div>
              <h3 className="text-2xl font-black brand-font uppercase text-white tracking-tight">
                Authorize <span className="text-emerald-500">Settlement</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-black/40 border border-white/5">
                  <p className="text-[8px] font-black text-zinc-500 uppercase">
                    Gross Revenue
                  </p>
                  <p className="text-sm font-black text-white italic">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-black/40 border border-white/5">
                  <p className="text-[8px] font-black text-rose-500 uppercase">
                    Platform Fee
                  </p>
                  <p className="text-sm font-black text-rose-500 italic">
                    ₹{stats.totalCommission.toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-6">
                Net Max Available:{" "}
                <span className="text-emerald-500 ml-2 italic">
                  ₹{stats.pendingPayout.toLocaleString()}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                Settlement magnitude (INR)
              </label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black border border-white/10 py-4 px-6 text-2xl font-black text-emerald-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setIsPayoutModalOpen(false)}
                className="flex-1 bg-white/5 text-white text-[10px] font-black uppercase p-6 rounded-none hover:bg-white/10 border-none"
              >
                Abort
              </Button>
              <Button
                onClick={handlePayout}
                disabled={isProcessing}
                className="flex-1 bg-emerald-500 text-black text-[10px] font-black uppercase p-6 rounded-none hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] border-none"
              >
                {isProcessing ? "Authorizing..." : "Confirm Payout"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Commission Configuration Modal */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm bg-zinc-900 border border-white/10 p-10 space-y-10"
          >
            <div>
              <h3 className="text-2xl font-black brand-font uppercase text-white tracking-tight italic">
                Platform <span className="text-orange-500">Deal.</span>
              </h3>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2 border-l border-orange-500 pl-3">
                Configure revenue sharing protocol for this unit.
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em]">
                  Transaction Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setCommData({ ...commData, type: "percentage" })
                    }
                    className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest border transition-all ${commData.type === "percentage" ? "bg-orange-500 text-black border-orange-500" : "bg-black text-zinc-500 border-white/5 hover:border-white/20"}`}
                  >
                    Percentage
                  </button>
                  <button
                    onClick={() => setCommData({ ...commData, type: "flat" })}
                    className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest border transition-all ${commData.type === "flat" ? "bg-orange-500 text-black border-orange-500" : "bg-black text-zinc-500 border-white/5 hover:border-white/20"}`}
                  >
                    Flat Fee
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em]">
                  Maginitude ({commData.type === "percentage" ? "%" : "INR"})
                </label>
                <input
                  type="number"
                  value={commData.value}
                  onChange={(e) =>
                    setCommData({ ...commData, value: Number(e.target.value) })
                  }
                  className="w-full bg-black border border-white/10 p-4 text-xl font-black text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setIsCommissionModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-none border-none text-[10px] font-black uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCommission}
                disabled={isProcessing}
                className="flex-1 bg-orange-500 hover:bg-orange-400 text-black rounded-none border-none text-[10px] font-black uppercase shadow-[0_0_20px_rgba(249,115,22,0.2)]"
              >
                {isProcessing ? "UPDATING..." : "SAVE DEAL"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ManagerDetailPage;
