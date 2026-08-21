import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  IndianRupee,
  Users,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Info,
  Zap,
  Activity,
  AlertTriangle,
  ClipboardList,
  Plus,
  Minus,
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { PaginationControls } from "@/components/portal/PaginationControls";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventTicketsTable, toTicketRows } from "@/components/portal/EventTicketsTable";
import { downloadTicketPdf } from "@/lib/downloadTicket";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { jsPDF } from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const defaultOfflineForm = {
  contactName: "",
  email: "",
  phoneNumber: "",
  ticketType: "",
  quantity: 1,
  note: "",
};

const ManageEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [offlineForm, setOfflineForm] = useState(defaultOfflineForm);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [attendeesPage, setAttendeesPage] = useState(1);
  const [downloadingTicketId, setDownloadingTicketId] = useState<string | null>(null);

  // Staff-side ticket retrieval — download a booking's PDF to forward it when
  // the buyer's confirmation email was never delivered.
  const handleDownloadTicket = async (bookingId: string) => {
    setDownloadingTicketId(bookingId);
    try {
      await downloadTicketPdf(bookingId);
    } catch (err: any) {
      toast.error(err?.message || "Could not download ticket.");
    } finally {
      setDownloadingTicketId(null);
    }
  };
  const ATTENDEES_PER_PAGE = 20;

  const toggleSoldOutMutation = useMutation({
    mutationFn: async (ticketIndex: number) => {
      const { data } = await api.patch(`/events/${id}/ticket-types/${ticketIndex}/toggle-sold-out`);
      return data;
    },
    onSuccess: () => {
      toast.success("Inventory status synchronized");
      fetchDetails();
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Trigger failed.");
    },
  });

  const cancelEventMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/events/${id}/cancel`);
      return data;
    },
    onSuccess: () => {
      toast.success("Event cancelled and refunds initiated.");
      fetchDetails();
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Cancellation failed.");
    },
  });

  const issueOfflineMutation = useMutation({
    mutationFn: async (form: typeof defaultOfflineForm) => {
      const { data } = await api.post("/bookings/offline", {
        eventId: id,
        tickets: [{ type: form.ticketType, quantity: form.quantity }],
        contactName: form.contactName,
        email: form.email || undefined,
        phoneNumber: form.phoneNumber || undefined,
        note: form.note || undefined,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Offline ticket issued successfully.");
      setOfflineOpen(false);
      setOfflineForm(defaultOfflineForm);
      fetchDetails();
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to issue ticket.");
    },
  });

  const handleOfflineSubmit = () => {
    if (!offlineForm.contactName.trim()) {
      toast.error("Attendee name is required.");
      return;
    }
    if (!offlineForm.ticketType) {
      toast.error("Please select a ticket type.");
      return;
    }
    if (offlineForm.quantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    issueOfflineMutation.mutate(offlineForm);
  };

  const getEventSlug = () =>
    data?.event?.title ? data.event.title.toLowerCase().replace(/[^a-z0-9]/g, "_") : "event";

  // The list on screen is paginated — exports pull the full (search-filtered) set
  const fetchAllForExport = async () => {
    const { data: full } = await api.get(`/manager/events/${id}/analytics`, {
      params: { limit: 0, search: appliedSearch || undefined },
    });
    return (full.recentBookings || []) as any[];
  };

  const downloadCSV = async () => {
    try {
      const bookings = await fetchAllForExport();
      if (!bookings.length) return;
      const headers = [
        "Booking ID", "Attendee Name", "Email", "Phone",
        "Ticket Details", "Total Tickets", "Amount Paid (INR)",
        "Source", "Booking Date",
      ];
      const rows = bookings.map((b: any) => [
        String(b._id),
        b.userName || "Anonymous",
        b.userEmail || "",
        b.userPhone || "",
        b.tickets.map((t: any) => `${t.quantity}x ${t.type}`).join("; "),
        b.tickets.reduce((s: number, t: any) => s + t.quantity, 0),
        b.totalAmount || 0,
        b.isOffline ? "Offline / Walk-in" : "Online",
        new Date(b.createdAt).toLocaleString(),
      ]);
      const csv = [headers, ...rows]
        .map((row) => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const link = document.createElement("a");
      link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      link.download = `attendees_${getEventSlug()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV downloaded: " + bookings.length + " attendees");
    } catch (err) {
      toast.error("Export failed.");
    }
  };

  const downloadPDF = async () => {
    try {
      const bookings = await fetchAllForExport();
      if (!bookings.length) return;
      const doc = new jsPDF({ orientation: "landscape" });
      const ev = data.event;
      doc.setProperties({ title: `Attendees: ${ev?.title || "Event"}`, author: "City Pulse" });

      doc.setFontSize(16); doc.setFont("helvetica", "bold");
      doc.text("Attendee Registry", 14, 18);
      doc.setFontSize(11); doc.setFont("helvetica", "italic");
      doc.text(ev?.title || "", 14, 25);
      doc.setFontSize(8); doc.setFont("helvetica", "normal");
      doc.text(`Venue: ${ev?.location?.venueName || "—"}   Event Date: ${ev?.date ? new Date(ev.date).toLocaleDateString() : "—"}   Generated: ${new Date().toLocaleString()}`, 14, 31);
      doc.setDrawColor(200, 200, 200); doc.line(14, 34, 283, 34);

      const cols   = ["Booking ID",  "Attendee",     "Email",         "Phone",       "Ticket(s)",     "Qty", "Paid (₹)",  "Source",   "Date"];
      const colX   = [14,            42,              90,              148,           188,             225,   240,         258,        272];
      const colW   = [28,            48,              58,              40,            37,              15,    18,          14,         24];

      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
      cols.forEach((c, i) => doc.text(c, colX[i], 40));
      doc.line(14, 42, 283, 42);

      doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      let y = 48;
      bookings.forEach((b: any) => {
        if (y > 195) {
          doc.addPage();
          doc.setFont("helvetica", "bold");
          cols.forEach((c, i) => doc.text(c, colX[i], 14));
          doc.line(14, 16, 283, 16);
          doc.setFont("helvetica", "normal");
          y = 22;
        }
        const trunc = (s: string, w: number) => s.length > w ? s.slice(0, w - 1) + "…" : s;
        doc.text(trunc(String(b._id).slice(-8), 10), colX[0], y);
        doc.text(trunc(b.userName || "Anonymous", 20), colX[1], y);
        doc.text(trunc(b.userEmail || "—", 28), colX[2], y);
        doc.text(trunc(b.userPhone || "—", 18), colX[3], y);
        const tix = b.tickets.map((t: any) => `${t.quantity}×${t.type}`).join(", ");
        doc.text(trunc(tix, 18), colX[4], y);
        doc.text(String(b.tickets.reduce((s: number, t: any) => s + t.quantity, 0)), colX[5], y);
        doc.text(String((b.totalAmount || 0).toLocaleString()), colX[6], y);
        doc.text(b.isOffline ? "Offline" : "Online", colX[7], y);
        doc.text(new Date(b.createdAt).toLocaleDateString(), colX[8], y);
        y += 7;
      });

      doc.setFontSize(7); doc.setTextColor(150);
      doc.text(`Total attendees: ${bookings.length}`, 14, doc.internal.pageSize.height - 8);

      doc.save(`attendees_${getEventSlug()}.pdf`);
      toast.success("PDF downloaded.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.");
    }
  };

  const downloadJSON = async () => {
    try {
      const bookings = await fetchAllForExport();
      if (!bookings.length) return;
      const blob = new Blob([JSON.stringify(bookings, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `attendees_${getEventSlug()}.json`;
      link.click(); URL.revokeObjectURL(url);
      toast.success("JSON downloaded.");
    } catch (err) {
      toast.error("Failed to download JSON.");
    }
  };

  // Debounce the search box, then commit it as a fetch input
  useEffect(() => {
    const t = setTimeout(() => setAppliedSearch(attendeeSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [attendeeSearch]);

  // Any new context (event, search) restarts from page 1
  useEffect(() => {
    setAttendeesPage(1);
  }, [id, appliedSearch]);

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, attendeesPage, appliedSearch]);

  const fetchDetails = async () => {
    try {
      // Reusing the analytics endpoint as it contains most required data
      const response = await api.get(`/manager/events/${id}/analytics`, {
        params: {
          page: attendeesPage,
          limit: ATTENDEES_PER_PAGE,
          search: appliedSearch || undefined,
        },
      });
      setData(response.data);
      // Server clamps out-of-range pages — keep the buttons in sync with what's shown
      if (response.data.pagination && response.data.pagination.page !== attendeesPage) {
        setAttendeesPage(response.data.pagination.page);
      }
    } catch (error) {
      toast.error("Failed to recover event details.");
      navigate("/portal/events");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
          Loading event...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { event, stats, ticketStats } = data;

  return (
    <div className="space-y-4 pb-8 p-3 md:p-4 bg-background min-h-screen">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-border pb-4">
        <Link
          to="/portal/events"
          className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors italic"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Events
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5 italic">
                {event.category}
              </Badge>
              <div
                className={`h-1.5 w-1.5 rounded-full ${event.isApproved ? "bg-emerald-500 shadow-[0_0_10px_#10B981]" : "bg-orange-500 animate-pulse"}`}
              />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                {event.isApproved ? "Verified Event" : "Under Review"}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-tight uppercase italic leading-none text-foreground drop-shadow-sm">
              {event.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/boost?eventId=${event._id}`}>
              <Button
                className="h-9 px-5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-black uppercase tracking-widest transition-all gap-2 border-none italic"
              >
                <Zap className="h-4 w-4 fill-primary" />
                Boost Event
              </Button>
            </Link>
            <Link to={`/portal/manager/events/${event._id}/edit`}>
              <Button
                className="h-9 px-5 rounded-lg bg-[#C4F000] text-black hover:bg-[#A3C800] text-[10px] font-black uppercase tracking-widest transition-all gap-2 shadow-lg border-none"
              >
                Edit Event
              </Button>
            </Link>
            <Link to={`/events/${event._id}`} target="_blank">
              <Button
                variant="outline"
                className="h-9 px-5 border-border rounded-lg bg-card hover:bg-muted text-[10px] font-black uppercase tracking-widest transition-all gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Public View
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <Tabs defaultValue="dashboard" className="w-full space-y-4">
        <TabsList className="bg-muted/50 border border-border p-1 rounded-lg w-fit h-auto">
          <TabsTrigger
            value="dashboard"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Inventory
          </TabsTrigger>
          <TabsTrigger
            value="attendees"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Attendees
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Tickets
          </TabsTrigger>
          <TabsTrigger
            value="personnel"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground text-[9px] font-black uppercase tracking-widest px-4 h-8 transition-all italic"
          >
            Personnel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-8 outline-none">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-8 space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-card border border-border rounded-xl shadow-sm group hover:border-emerald-500/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 flex items-center gap-2">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-500" /> Net Revenue
                  </p>
                  <div className="text-2xl font-black text-emerald-500 italic uppercase tabular-nums">
                    ₹{(stats.netRevenue || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-xl shadow-sm group hover:border-primary/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 flex items-center gap-2">
                    <Ticket className="h-3.5 w-3.5 text-primary" /> Tickets Sold
                  </p>
                  <div className="text-2xl font-black text-foreground italic uppercase tabular-nums">
                    {stats.totalTicketsSold} <span className="text-xs text-muted-foreground font-black">/ {stats.capacity}</span>
                  </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-xl shadow-sm group hover:border-blue-500/30 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Occupancy
                  </p>
                  <div className="text-2xl font-black text-blue-500 italic uppercase tabular-nums">
                    {stats.capacity > 0 ? ((stats.totalTicketsSold / stats.capacity) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>

              {/* Revenue History Chart */}
              <section className="p-4 bg-card border border-border rounded-lg shadow-sm space-y-4 shadow-black/5">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2.5 text-muted-foreground">
                     <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                     <h2 className="text-[9px] font-black uppercase tracking-[0.3em] italic">Revenue Trend</h2>
                   </div>
                   <Badge variant="outline" className="rounded-md border-emerald-500/20 text-emerald-500 bg-emerald-500/5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 italic">
                      Last 7 Days
                   </Badge>
                </div>
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.salesHistory || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fontWeight: 900, fill: "hsl(var(--muted-foreground))" }} 
                        dy={10}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.75rem",
                          fontSize: "9px",
                          fontWeight: 900,
                          textTransform: "uppercase"
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* About Event */}
              <section className="p-4 bg-card border border-border rounded-lg shadow-sm space-y-3.5 shadow-black/5">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  <h2 className="text-[9px] font-black uppercase tracking-[0.3em] italic">Event Overview</h2>
                </div>
                <p className="text-foreground leading-relaxed font-bold italic text-xs opacity-80">
                  {event.description}
                </p>
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
                   <div className="space-y-1.5">
                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Schedule</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase italic">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase italic">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {event.time}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Location</p>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-black brand-font uppercase text-foreground italic tracking-tight">
                          {event.location?.venueName || "Venue Unspecified"}
                        </h4>
                        <p className="text-muted-foreground font-medium italic mt-1 text-[11px] opacity-70">
                          {typeof event.location === "string" ? event.location : event.location?.address}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          (event.location?.venueName || "") + " " + (typeof event.location === "string" ? event.location : event.location?.address || "")
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                        title="Open in Google Maps"
                      >
                        <MapPin className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Actions */}
            <div className="lg:col-span-4 space-y-4">
               <section className="p-4 bg-muted/30 border border-border rounded-lg space-y-3 shadow-black/5">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center mb-4 italic opacity-60">Quick Actions</h3>
                  <Link to={`/portal/manager/events/${event._id}/edit`} className="block">
                    <Button className="w-full h-10 rounded-lg bg-[#C4F000] text-black hover:bg-[#A3C800] text-[9px] font-black uppercase tracking-widest shadow-lg border-none italic">
                      Edit Event
                    </Button>
                  </Link>
                  <Link to={`/portal/manager/events/${event._id}/analytics`} className="block">
                    <Button className="w-full h-10 rounded-lg bg-card border border-border hover:bg-muted text-foreground text-[9px] font-black uppercase tracking-widest shadow-sm italic">
                      Full Analytics
                    </Button>
                  </Link>
                  <Link to={`/portal/manager/events/${id}/volunteers`} className="block">
                    <Button className="w-full h-10 rounded-lg bg-card border border-border hover:bg-muted text-foreground text-[9px] font-black uppercase tracking-widest shadow-sm italic">
                      Manage Volunteers
                    </Button>
                  </Link>

                  <Button
                    onClick={() => setOfflineOpen(true)}
                    className="w-full h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white text-[9px] font-black uppercase tracking-widest shadow-sm italic transition-all gap-2"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Issue Offline Ticket
                  </Button>

                  {event.status !== 'cancelled' && event.status !== 'past' && (new Date(event.date) > new Date()) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white text-[9px] font-black uppercase tracking-widest shadow-sm italic transition-all gap-2">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Cancel Event
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border rounded-2xl max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3 text-rose-500">
                            <AlertTriangle className="h-6 w-6" />
                            Irreversible Action
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm font-bold italic opacity-70">
                            You are about to cancel <span className="text-foreground font-black">"{event.title}"</span>. 
                            This will automatically:
                            <ul className="list-disc list-inside mt-3 space-y-1 text-xs">
                              <li>Refund all confirmed ticket holders via Razorpay.</li>
                              <li>Invalidate all existing tickets for this event.</li>
                              <li>Stop any pending payouts.</li>
                            </ul>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6">
                          <AlertDialogCancel className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] border-border italic">Keep Event</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => cancelEventMutation.mutate()}
                            className="h-10 rounded-xl bg-rose-500 text-white hover:bg-rose-600 font-black uppercase tracking-widest text-[10px] border-none italic"
                          >
                            Yes, Cancel & Refund
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
              </section>

              <section className="p-6 bg-primary/5 border border-primary/10 rounded-[1.5rem] space-y-4">
                 <div className="flex items-center gap-2 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Platform Sync</span>
                 </div>
                 <p className="text-[10px] font-medium italic text-muted-foreground leading-relaxed">
                   This event is synced with the platform.
                 </p>
              </section>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="outline-none">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ticketStats.map((tt: any, i: number) => (
              <div key={i} className="p-4 bg-card border border-border rounded-lg shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between shadow-black/5">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black uppercase text-xs tracking-widest text-foreground italic">{tt.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground italic mt-1">₹{tt.price.toLocaleString()} Unit Cost</p>
                    </div>
                    <Badge variant="outline" className="rounded-md border-border/50 bg-muted/20 text-[8px] font-black uppercase tracking-tighter">
                      Tier {i + 1}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between mb-1.5">
                     <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50">Utilisation</span>
                     <span className="text-[11px] font-black italic">{tt.isSoldOut ? tt.capacity : tt.sold} / {tt.capacity}</span>
                  </div>
                  <Progress value={tt.isSoldOut ? 100 : (tt.sold / tt.capacity) * 100} className="h-1.5 bg-muted rounded-full overflow-hidden">
                     <div className={`h-full ${tt.isSoldOut ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${tt.isSoldOut ? 100 : (tt.sold / tt.capacity) * 100}%` }} />
                  </Progress>
                </div>
                <div className="mt-6 pt-4 border-t border-border/30 flex justify-between items-center">
                   <button
                    onClick={() => toggleSoldOutMutation.mutate(i)}
                    disabled={toggleSoldOutMutation.isPending}
                    className={`text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 transition-all px-2.5 py-1.5 rounded-lg border italic ${tt.isSoldOut ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-rose-500 border-rose-500/20 bg-rose-500/5"}`}
                  >
                    <Zap className={`h-3 w-3 ${tt.isSoldOut ? "animate-pulse" : ""}`} />
                    {tt.isSoldOut ? "Locked" : "Sold Out"}
                  </button>
                   <p className="text-lg font-black italic text-foreground tabular-nums tracking-tight">₹{tt.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="outline-none space-y-4">
          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Bookings", value: data.stats?.bookingCounts?.total ?? 0 },
              { label: "Total Tickets", value: data.stats?.totalTicketsSold ?? 0 },
              { label: "Online Bookings", value: data.stats?.bookingCounts?.online ?? 0 },
              { label: "Offline / Walk-in", value: data.stats?.bookingCounts?.offline ?? 0 },
            ].map((s) => (
              <div key={s.label} className="p-3 bg-card border border-border rounded-xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{s.label}</p>
                <p className="text-xl font-black tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
            {/* Header: search + export */}
            <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
              <div className="flex items-center gap-3 flex-1 w-full sm:max-w-xs">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="Search by name, email or phone…"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  className="h-8 flex-1 bg-background border border-border/50 rounded-lg px-3 text-[11px] font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>
              {(data.pagination?.total ?? 0) > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-8 px-4 rounded-lg bg-foreground text-background hover:bg-primary hover:text-primary-foreground text-[8px] font-black uppercase tracking-widest transition-all gap-2 border-none shrink-0">
                      <Download className="h-3.5 w-3.5" />
                      Export Attendees
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover border-border" align="end">
                    <DropdownMenuItem onClick={downloadCSV} className="font-bold text-xs uppercase cursor-pointer gap-2 py-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Download CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadPDF} className="font-bold text-xs uppercase cursor-pointer gap-2 py-2">
                      <FileText className="h-4 w-4 text-rose-500" /> Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={downloadJSON} className="font-bold text-xs uppercase cursor-pointer gap-2 py-2">
                      <FileCode className="h-4 w-4 text-blue-500" /> Download JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {(() => {
                const bookings = data.recentBookings || [];
                return (
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-muted/10 text-muted-foreground text-[8px] font-black uppercase tracking-[0.2em] border-b border-border italic">
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Attendee</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Ticket(s)</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Source</th>
                        <th className="px-4 py-3">Booked On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {bookings.length > 0 ? (
                        bookings.map((booking: any, idx: number) => (
                          <tr key={booking._id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 font-black text-[9px] text-muted-foreground/50 tabular-nums italic">
                              {(attendeesPage - 1) * ATTENDEES_PER_PAGE + idx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] shrink-0">
                                  {(booking.userName || "A").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-black text-[11px] uppercase tracking-tight text-foreground italic leading-none">
                                    {booking.userName || "Anonymous"}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground/50 font-mono mt-0.5">
                                    {String(booking._id).slice(-8)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-[11px] text-muted-foreground">
                              {booking.userEmail || <span className="text-muted-foreground/30">—</span>}
                            </td>
                            <td className="px-4 py-3 font-medium text-[11px] text-muted-foreground">
                              {booking.userPhone || <span className="text-muted-foreground/30">—</span>}
                            </td>
                            <td className="px-4 py-3 font-medium text-[11px] text-muted-foreground italic">
                              {booking.tickets.map((t: any) => `${t.quantity}× ${t.type}`).join(", ")}
                            </td>
                            <td className="px-4 py-3 text-center font-black text-[11px]">
                              {booking.tickets.reduce((s: number, t: any) => s + t.quantity, 0)}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-emerald-500 tabular-nums italic text-xs">
                              ₹{(booking.totalAmount || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                booking.isOffline
                                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}>
                                {booking.isOffline ? "Offline" : "Online"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                              {new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              <span className="block text-[9px] text-muted-foreground/50">
                                {new Date(booking.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-6 py-16 text-center text-[10px] font-black uppercase text-muted-foreground/50 italic">
                            {attendeeSearch ? "No attendees match your search." : "No bookings yet."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                );
              })()}
            </div>
            {data.pagination && (
              <PaginationControls
                pagination={data.pagination}
                onPageChange={setAttendeesPage}
                label="ATTENDEES"
                showWhenSinglePage
                rightSlot={
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 italic">
                    Confirmed bookings only
                  </p>
                }
                className="px-4 py-3 border-t border-border/30 bg-muted/10"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="outline-none space-y-4">
          {/* Summary strip — event-wide ticket stats (pre-filter server side) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Tickets Sold", value: stats?.totalTicketsSold ?? 0 },
              { label: "Checked In", value: stats?.totalCheckedIn ?? 0 },
              { label: "Offline Tickets", value: stats?.offlineTickets ?? 0 },
              {
                label: "Utilisation",
                value: `${
                  (stats?.capacity ?? 0) > 0
                    ? (((stats?.totalTicketsSold ?? 0) / stats.capacity) * 100).toFixed(1)
                    : 0
                }%`,
              },
            ].map((s) => (
              <div key={s.label} className="p-3 bg-card border border-border rounded-xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{s.label}</p>
                <p className="text-xl font-black tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          <EventTicketsTable
            rows={toTicketRows(
              (data.recentBookings || []).map((b: any) => ({
                _id: b._id,
                name: b.userName,
                email: b.userEmail,
                phone: b.userPhone,
                isOffline: b.isOffline,
                createdAt: b.createdAt,
                tickets: b.tickets,
              }))
            )}
            onDownloadTicket={handleDownloadTicket}
            downloadingId={downloadingTicketId}
            emptyLabel={attendeeSearch ? "No tickets match your search." : "No tickets sold yet."}
            headerExtra={
              <div className="flex items-center gap-3 w-full sm:max-w-xs">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="Search by name, email or phone…"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  className="h-8 flex-1 bg-background border border-border/50 rounded-lg px-3 text-[11px] font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>
            }
            footer={
              data.pagination && (
                <PaginationControls
                  pagination={data.pagination}
                  onPageChange={setAttendeesPage}
                  label="BOOKINGS"
                  showWhenSinglePage
                  rightSlot={
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 italic">
                      One row per ticket line item
                    </p>
                  }
                  className="px-4 py-3 border-t border-border/30 bg-muted/10"
                />
              )
            }
          />
        </TabsContent>

        <TabsContent value="personnel" className="outline-none">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
             <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Event Volunteers
                </h3>
                <Link to={`/portal/manager/events/${id}/volunteers`}>
                   <Button size="sm" className="bg-foreground text-background hover:bg-emerald-500 hover:text-white text-[8px] font-black uppercase h-8 px-4 rounded-lg border-none shadow-sm transition-all">
                      Manage Volunteers
                   </Button>
                </Link>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-muted/10 text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] border-b border-border">
                     <th className="px-6 py-4">Volunteer</th>
                     <th className="px-6 py-4">Gate / Station</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Added On</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/30">
                   {(data.volunteers || []).length > 0 ? (
                     data.volunteers.map((v: any) => (
                       <tr key={v._id} className="hover:bg-muted/10 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <div className="h-8 w-8 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-lg font-black text-xs">
                                  {v.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-black text-xs uppercase tracking-tight text-foreground">{v.name}</p>
                                  <p className="text-[9px] text-muted-foreground font-black italic">{v.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-orange-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{v.gate || "Not Assigned"}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-500">
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981]" />
                               Active
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right font-black text-[10px] text-muted-foreground tabular-nums uppercase">
                            {new Date(v.createdAt).toLocaleDateString()}
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-[10px] font-black uppercase text-muted-foreground italic">
                           No volunteers assigned yet.
                        </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Offline Ticket Dialog */}
      <Dialog open={offlineOpen} onOpenChange={setOfflineOpen}>
        <DialogContent className="bg-card border-border rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase italic tracking-tight flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-blue-400" />
              Issue Offline Ticket
            </DialogTitle>
            <DialogDescription className="text-xs font-bold italic opacity-60 leading-relaxed">
              Manually create a confirmed booking for walk-ins or cash payments. A ticket will be sent via email/WhatsApp if contact details are provided.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                Attendee Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                className="h-11 bg-background/50 border-white/10 rounded-lg font-bold text-sm"
                placeholder="Full name"
                value={offlineForm.contactName}
                onChange={(e) => setOfflineForm((f) => ({ ...f, contactName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  className="h-11 bg-background/50 border-white/10 rounded-lg font-bold text-sm"
                  placeholder="Optional"
                  value={offlineForm.email}
                  onChange={(e) => setOfflineForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Phone</Label>
                <Input
                  type="tel"
                  className="h-11 bg-background/50 border-white/10 rounded-lg font-bold text-sm"
                  placeholder="+91..."
                  value={offlineForm.phoneNumber}
                  onChange={(e) => setOfflineForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                Ticket Type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={offlineForm.ticketType}
                onValueChange={(v) => setOfflineForm((f) => ({ ...f, ticketType: v }))}
              >
                <SelectTrigger className="h-11 bg-background/50 border-white/10 rounded-lg font-bold text-sm">
                  <SelectValue placeholder="Select ticket type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {(event?.ticketTypes || [])
                    .filter((tt: any) => !tt.isSoldOut && tt.capacity - tt.sold > 0)
                    .map((tt: any) => (
                      <SelectItem key={tt.name} value={tt.name} className="font-bold text-sm">
                        {tt.name}: ₹{tt.price.toLocaleString()} ({tt.capacity - tt.sold} left)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Quantity</Label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOfflineForm((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                  className="h-11 w-11 rounded-lg border border-white/10 bg-background/50 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center font-black text-xl tabular-nums">{offlineForm.quantity}</span>
                <button
                  type="button"
                  onClick={() => setOfflineForm((f) => ({ ...f, quantity: f.quantity + 1 }))}
                  className="h-11 w-11 rounded-lg border border-white/10 bg-background/50 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Internal Note</Label>
              <Textarea
                className="min-h-[72px] bg-background/50 border-white/10 rounded-lg font-bold text-sm resize-none"
                placeholder="e.g. Paid cash at gate, press pass, complimentary..."
                value={offlineForm.note}
                onChange={(e) => setOfflineForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => { setOfflineOpen(false); setOfflineForm(defaultOfflineForm); }}
              className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] border-border italic flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOfflineSubmit}
              disabled={issueOfflineMutation.isPending}
              className="h-10 rounded-xl bg-blue-500 text-white hover:bg-blue-400 font-black uppercase tracking-widest text-[10px] border-none italic flex-1"
            >
              {issueOfflineMutation.isPending ? "Issuing..." : "Issue Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageEventPage;
