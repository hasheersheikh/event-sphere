import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Ticket,
  IndianRupee,
  Users,
  ShieldCheck,
  Clock,
  ExternalLink,
  TrendingUp,
  BarChart3,
  Mail,
  User,
  LayoutDashboard,
  ShieldAlert,
  MapPin,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { toast } from "sonner";

interface EventInsights {
  event: any;
  stats: {
    totalRevenue: number;
    totalTicketsSold: number;
    capacity: number;
  };
  ticketStats: Array<{
    name: string;
    price: number;
    capacity: number;
    sold: number;
    revenue: number;
  }>;
  volunteers: Array<{
    _id: string;
    name: string;
    email: string;
    gate: string;
  }>;
  attendees: Array<{
    _id: string;
    name: string;
    email: string;
    tickets: Array<{ type: string; quantity: number }>;
    bookedAt: string;
    totalAmount: number;
  }>;
}

const EventInsightsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<EventInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReleasingPayout, setIsReleasingPayout] = useState(false);
  const [showPayoutConfirm, setShowPayoutConfirm] = useState(false);
  const [payoutReleased, setPayoutReleased] = useState(false);
  const [attendeesPage, setAttendeesPage] = useState(1);
  const ATTENDEES_PER_PAGE = 20;

  useEffect(() => {
    fetchInsights();
  }, [id]);

  const fetchInsights = async () => {
    try {
      const response = await api.get(`/admin/events/${id}/insights`);
      setData(response.data);
    } catch (error) {
      toast.error("Failed to recover insights protocol.");
      navigate("/portal/admin/events");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReleasePayout = () => setShowPayoutConfirm(true);

  const handleReleasePayout = async () => {
    if (!data?.event?._id) return;
    setShowPayoutConfirm(false);
    setIsReleasingPayout(true);
    try {
      const response = await api.post(`/admin/payout/events/${data.event._id}`);
      toast.success(`Payout of ₹${response.data.payoutAmount?.toLocaleString() || '...'} initiated successfully!`);
      setPayoutReleased(true);
      fetchInsights(); // Refresh data to update status
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to release payout.");
    } finally {
      setIsReleasingPayout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">
          Syncing Insights...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { event, stats, ticketStats, attendees, volunteers } = data;
  const sellThroughRate = stats.capacity > 0 ? (stats.totalTicketsSold / stats.capacity) * 100 : 0;
  const paginatedAttendees = attendees.slice((attendeesPage - 1) * ATTENDEES_PER_PAGE, attendeesPage * ATTENDEES_PER_PAGE);
  const totalAttendeePages = Math.ceil(attendees.length / ATTENDEES_PER_PAGE);

  return (
    <div className="space-y-4 pb-8 p-3 md:p-4 bg-background text-foreground min-h-screen">
      {/* Payout Confirmation Dialog */}
      <Dialog open={showPayoutConfirm} onOpenChange={setShowPayoutConfirm}>
        <DialogContent className="bg-card border-border rounded-2xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase italic tracking-tight">Authorize Payout</DialogTitle>
            <DialogDescription className="text-[11px] font-medium uppercase tracking-widest leading-relaxed opacity-70">
              You are about to release ₹{stats.totalRevenue.toLocaleString()} to the event organizer. This action is permanent and will initiate the fund transfer protocol.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 border-y border-border/50 my-2">
             <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Net Payable</span>
                <span className="text-xl font-black italic text-emerald-500 tabular-nums">₹{stats.totalRevenue.toLocaleString()}</span>
             </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowPayoutConfirm(false)}
              className="rounded-xl text-[9px] font-black uppercase tracking-widest italic"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReleasePayout}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest italic"
            >
              Confirm Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Navigation & Header */}
      <header className="flex flex-col gap-4 border-b border-border pb-4">
        <Link
          to="/portal/admin/events"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Queue
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500/10 text-orange-500 border-none rounded-full text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5">
                {event.category}
              </Badge>
              {event.isApproved ? (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-500 italic opacity-80">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Event
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase text-orange-500 italic animate-pulse">
                  <Clock className="h-3 w-3" />
                  Authorization Pending
                </span>
              )}
            </div>
            <h1 className="text-lg md:text-xl font-black brand-font tracking-tight uppercase leading-none italic text-foreground">
              {event.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {stats.totalRevenue > 0 && (
              <Button
                onClick={confirmReleasePayout}
                disabled={isReleasingPayout || payoutReleased}
                type="button"
                className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2 shadow-sm italic disabled:opacity-50"
              >
                <IndianRupee className="h-3.5 w-3.5" />
                {isReleasingPayout ? "RELEASING..." : payoutReleased ? "PAYOUT RELEASED" : "RELEASE PAYOUT"}
              </Button>
            )}
            <Link to={`/portal/admin/events/${event._id}/edit`}>
              <Button
                variant="outline"
                className="h-9 px-5 border-border rounded-xl bg-card hover:bg-primary hover:text-white text-[9px] font-black uppercase tracking-widest transition-all gap-2 shadow-sm italic"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Event
              </Button>
            </Link>
            <Link to={`/events/${event._id}`} target="_blank">
              <Button
                variant="outline"
                className="h-9 px-5 border-border rounded-xl bg-card hover:bg-muted text-[9px] font-black uppercase tracking-widest transition-all gap-2 shadow-sm italic"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Public View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <Tabs defaultValue="dashboard" className="space-y-5">
        <TabsList className="bg-muted/30 border border-border p-1 rounded-xl w-fit">
          <TabsTrigger
            value="dashboard"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="attendees"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Attendees
          </TabsTrigger>
          <TabsTrigger
            value="personnel"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Personnel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-10 outline-none">
          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Gross Revenue",
                value: `₹${stats.totalRevenue.toLocaleString()}`,
                icon: IndianRupee,
                color: "text-emerald-500",
              },
              {
                label: "Tickets Sold",
                value: stats.totalTicketsSold,
                icon: Ticket,
                color: "text-orange-500",
              },
              {
                label: "Utilisation",
                value: `${sellThroughRate.toFixed(1)}%`,
                icon: TrendingUp,
                color: "text-blue-500",
              },
              {
                label: "Personnel Units",
                value: volunteers.length,
                icon: Users,
                color: "text-rose-500",
              },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border p-4 rounded-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all shadow-sm"
              >
                <kpi.icon
                  className={`absolute -right-4 -bottom-4 h-16 w-16 ${kpi.color} opacity-[0.03] group-hover:scale-110 transition-transform duration-700`}
                />
                <div
                  className={`text-[9px] font-black uppercase tracking-widest mb-3 ${kpi.color} italic opacity-70`}
                >
                  {kpi.label}
                </div>
                <div className="text-lg font-black italic uppercase tabular-nums text-foreground">
                  {kpi.value}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-muted-foreground opacity-50">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <h2 className="text-[9px] font-black uppercase tracking-widest italic leading-none">Event Details</h2>
                </div>
                <p className="text-foreground leading-relaxed font-bold italic text-[13px]">
                  {event.description}
                </p>
                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border">
                  <div className="space-y-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Timeline</p>
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase italic text-foreground/80">
                      <Calendar className="h-3.5 w-3.5 text-orange-500/50" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase italic text-foreground/80">
                      <Clock className="h-3.5 w-3.5 text-orange-500/50" />
                      {event.time}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Geography</p>
                    <div className="flex items-start gap-2">
                       <MapPin className="h-3.5 w-3.5 text-orange-500/50 shrink-0 mt-0.5" />
                       <div className="min-w-0">
                          <p className="text-[12px] font-black uppercase italic text-foreground/90 truncate">{event.location?.venueName}</p>
                          <p className="text-[9px] text-muted-foreground font-bold italic truncate opacity-50">{event.location?.address}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <section className="p-5 bg-card border border-border rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-muted-foreground opacity-50">
                  <User className="h-3.5 w-3.5" />
                  <h2 className="text-[9px] font-black uppercase tracking-widest italic leading-none">Unit Commander</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted border border-border flex items-center justify-center rounded-xl text-foreground font-black text-xs">
                    {event.creator?.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black uppercase text-[12px] tracking-tight truncate text-foreground">{event.creator?.name}</h4>
                    <p className="text-[9px] text-muted-foreground font-bold italic truncate opacity-50">{event.creator?.email}</p>
                  </div>
                </div>
                <Link to={`/portal/admin/managers/${event.creator?._id}`} className="block">
                  <Button className="w-full h-9 rounded-xl bg-foreground text-background hover:bg-orange-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all italic">
                    Commander Profile
                  </Button>
                </Link>
              </section>

              <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-2.5">
                 <div className="flex items-center gap-2 text-orange-500/70">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="text-[8px] font-black uppercase tracking-widest italic">Protocol Secured</span>
                 </div>
                 <p className="text-[9px] font-medium italic text-muted-foreground opacity-60 leading-relaxed">
                   Event assets are currently under administrative review for platform compliance.
                 </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="outline-none">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ticketStats.map((tt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 bg-card border border-border rounded-2xl shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <h4 className="font-black uppercase text-[12px] tracking-widest text-foreground truncate">{tt.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground italic mt-0.5 opacity-50">₹{tt.price.toLocaleString()} Capacity</p>
                    </div>
                    <Badge variant="outline" className="rounded-lg border-border bg-muted/20 text-[7px] font-black uppercase tracking-widest py-0 px-1.5 h-4 italic">
                       Tier {i+1}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                     <span className="text-[9px] font-black text-muted-foreground/40 uppercase italic leading-none">Utilisation</span>
                     <span className="text-[11px] font-black italic text-foreground/70 leading-none">{tt.sold} / {tt.capacity}</span>
                  </div>
                  <Progress value={(tt.sold / tt.capacity) * 100} className="h-1 bg-muted rounded-full overflow-hidden" />
                </div>
                <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-end">
                   <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 italic leading-none">Yield Contribution</p>
                   <p className="text-lg font-black italic text-emerald-500 leading-none tracking-tight">₹{tt.revenue.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="outline-none">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Registry Node</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Classification</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Asset Volume</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 text-right italic">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {attendees.length > 0 ? (
                      paginatedAttendees.map((at, i) => (
                        <tr key={i} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-4 py-3">
                             <div className="font-black uppercase tracking-tight text-[12px] group-hover:text-orange-500 transition-colors text-foreground">{at.name}</div>
                             <div className="text-[9px] text-muted-foreground font-bold italic opacity-40">{at.email}</div>
                          </td>
                          <td className="px-4 py-3">
                             <div className="flex flex-wrap gap-1">
                                {at.tickets.map((t, idx) => (
                                  <Badge key={idx} variant="outline" className="text-[7px] font-black hover:bg-orange-500/10 transition-colors py-0 px-1.5 h-4 italic">
                                     {t.quantity}x {t.type}
                                  </Badge>
                                ))}
                             </div>
                          </td>
                          <td className="px-4 py-3">
                             <span className="font-black text-[12px] italic text-foreground/80">{at.tickets.reduce((sum, t) => sum + t.quantity, 0)} Units</span>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-[12px] text-emerald-500 italic tabular-nums leading-none">
                             ₹{at.totalAmount.toLocaleString()}
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-16 text-center italic text-muted-foreground/30 text-[9px] font-black uppercase tracking-widest">
                           No Registry Transfers Detected
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
             {totalAttendeePages > 1 && (
               <div className="p-4 border-t border-border flex items-center justify-between bg-muted/5">
                 <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50 italic">
                   Page {attendeesPage} of {totalAttendeePages}
                 </p>
                 <div className="flex gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     disabled={attendeesPage === 1}
                     onClick={() => setAttendeesPage(p => p - 1)}
                     className="h-7 rounded-lg text-[8px] font-black uppercase tracking-widest border-border italic"
                   >
                     Prev
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     disabled={attendeesPage === totalAttendeePages}
                     onClick={() => setAttendeesPage(p => p + 1)}
                     className="h-7 rounded-lg text-[8px] font-black uppercase tracking-widest border-border italic"
                   >
                     Next
                   </Button>
                 </div>
               </div>
             )}
          </div>
        </TabsContent>

        <TabsContent value="personnel" className="outline-none">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
             <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2.5 text-foreground italic">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/50" />
                  Deployed Personnel Roster
                </h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/10 text-muted-foreground/40 text-[8px] font-black uppercase tracking-widest border-b border-border italic">
                      <th className="px-4 py-3">Field Unit Identity</th>
                      <th className="px-4 py-3">Operational Node</th>
                      <th className="px-4 py-3">Relay Connectivity</th>
                      <th className="px-4 py-3 text-right">Commission Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {volunteers.length > 0 ? (
                      volunteers.map((v) => (
                        <tr key={v._id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3">
                             <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-orange-500/10 text-orange-500 flex items-center justify-center rounded-lg font-black text-[10px]">
                                   {v.name.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-black text-[12px] uppercase tracking-tight text-foreground">{v.name}</p>
                                   <p className="text-[9px] text-muted-foreground font-bold italic opacity-40">{v.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-3">
                             <div className="flex items-center gap-1.5 opacity-60">
                                <MapPin className="h-3 w-3 text-orange-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{v.gate || "GRID DEFAULT"}</span>
                             </div>
                          </td>
                          <td className="px-4 py-3">
                             <span className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-500 italic">
                                <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                                Active
                             </span>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-[9px] text-muted-foreground/40 tabular-nums uppercase italic">
                             {(v as any).createdAt ? new Date((v as any).createdAt).toLocaleDateString() : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                         <td colSpan={4} className="px-4 py-16 text-center text-[9px] font-black uppercase text-muted-foreground/30 italic">
                            No units assigned to this event grid.
                         </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default EventInsightsPage;
