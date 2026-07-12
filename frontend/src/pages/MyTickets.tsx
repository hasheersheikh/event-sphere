import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Ticket,
  Calendar,
  MapPin,
  Download,
  ExternalLink,
  Clock,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TicketTemplate from "@/components/tickets/TicketTemplate";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { CalendarPlus } from "lucide-react";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import { formatPrice } from "@/lib/utils";

const NEON = "#C4F000";

const MyTickets = () => {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [activeDownloadBooking, setActiveDownloadBooking] = useState<any>(null);
  const [selectedBookingForQR, setSelectedBookingForQR] = useState<any>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const { data } = await api.get("/bookings");
      return data;
    },
  });

  const activeTickets =
    bookings?.filter(
      (b: any) => (b.status === "confirmed" || b.status === "pending") && b.event,
    ) || [];
  const pastTickets =
    bookings?.filter(
      (b: any) =>
        (b.status === "expired" || b.status === "cancelled" || b.status === "refunded") && b.event,
    ) || [];

  const handleDownload = async (booking: any) => {
    setIsDownloading(booking._id);
    setActiveDownloadBooking(booking);
    setTimeout(async () => {
      try {
        const element = ticketRef.current;
        if (!element) throw new Error("Template not found");
        const canvas = await html2canvas(element, {
          scale: 2, useCORS: true, logging: false, backgroundColor: "#0d0d0d",
        });
        const imgData = canvas.toDataURL("image/png");
        const canvasH = Math.round((canvas.height / canvas.width) * 800);
        const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [800, canvasH] });
        pdf.addImage(imgData, "PNG", 0, 0, 800, canvasH);
        pdf.setProperties({ title: `CityPulse-Ticket-${booking._id}`, subject: "Event Admission Ticket", author: "City Pulse", creator: "Portal" });
        pdf.save(`Ticket-${booking.event?.title?.replace(/\s+/g, "-") || "Event"}.pdf`);
        toast.success("Ticket downloaded!");
      } catch (err) {
        toast.error("Failed to generate ticket.");
      } finally {
        setIsDownloading(null);
        setActiveDownloadBooking(null);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16 pb-24">
        {/* Page header */}
        <div className="border-b border-border/20 py-8">
          <div className="container">
            <p className="text-[9px] font-black uppercase tracking-[0.6em] text-muted-foreground/50 mb-1">My Account</p>
            <div className="flex items-end gap-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">My Tickets</h1>
              {!isLoading && (
                <span className="mb-1 text-sm font-black text-[#C4F000]">
                  {activeTickets.length} active
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="container py-10 space-y-14">
          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border overflow-hidden">
                  <Skeleton className="h-28 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="px-5 pb-5 flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-xl" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Active Tickets */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#C4F000] animate-pulse" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">
                    Active Tickets
                  </h2>
                  <span className="text-[10px] font-black text-muted-foreground">({activeTickets.length})</span>
                </div>

                {activeTickets.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {activeTickets.map((booking: any, i: number) => (
                      <TicketCard
                        key={booking._id}
                        booking={booking}
                        index={i}
                        onDownload={() => handleDownload(booking)}
                        isLoading={isDownloading === booking._id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/50 p-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-[#C4F000]/10 flex items-center justify-center mx-auto mb-5">
                      <Ticket className="h-8 w-8 text-[#C4F000]" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-2">No tickets yet</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      You don't have any upcoming events.
                    </p>
                    <Link to="/events">
                      <Button className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-[#C4F000] text-black hover:bg-[#A3C800]">
                        Browse Events
                      </Button>
                    </Link>
                  </div>
                )}
              </section>

              {/* Past Tickets */}
              {pastTickets.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                      Past & Expired
                    </h2>
                    <span className="text-[10px] font-black text-muted-foreground">({pastTickets.length})</span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 opacity-60">
                    {pastTickets.map((booking: any, i: number) => (
                      <TicketCard
                        key={booking._id}
                        booking={booking}
                        index={i}
                        isPast
                        onDownload={() => handleDownload(booking)}
                        isLoading={isDownloading === booking._id}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Hidden PDF render target */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        {activeDownloadBooking &&
          activeDownloadBooking.tickets?.map((t: any, idx: number) => (
            <div key={`${activeDownloadBooking._id}-${idx}`}>
              <TicketTemplate ref={ticketRef} booking={activeDownloadBooking} ticket={t} />
            </div>
          ))}
      </div>
    </div>
  );
};

/* ─── Ticket Card ─────────────────────────────────────────────────────────── */

const TicketCard = ({
  booking,
  index = 0,
  isPast,
  onDownload,
  isLoading,
}: {
  booking: any;
  index?: number;
  isPast?: boolean;
  onDownload?: () => void;
  isLoading?: boolean;
}) => {
  const event = booking.event;
  const isConfirmed = booking.status === "confirmed";

  const dateStr = event?.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
      })
    : "Date unavailable";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-border/60 bg-white dark:bg-card shadow-[0_2px_12px_rgba(0,0,0,0.10),0_8px_32px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] flex flex-col"
    >
      {/* ── Header strip ── */}
      <div className="relative bg-zinc-900 px-5 pt-5 pb-6">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full ${
            isPast
              ? "bg-white/10 text-white/50"
              : isConfirmed
              ? "bg-[#C4F000]/15 text-[#C4F000]"
              : "bg-yellow-500/15 text-yellow-400"
          }`}>
            {isPast ? "Expired" : isConfirmed ? "● Valid" : booking.status}
          </span>
          <Ticket className="h-4 w-4 text-white/20" />
        </div>

        {/* Event title */}
        <h3 className="text-white font-black text-lg leading-tight tracking-tight line-clamp-2 mb-1">
          {event?.title || "Deleted Event"}
        </h3>

        {/* Ticket types summary */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {booking.tickets.map((t: any, idx: number) => (
            <span
              key={idx}
              className="text-[9px] font-black uppercase tracking-wider bg-white/10 text-white/70 px-2 py-0.5 rounded-full"
            >
              {t.quantity}× {t.type}
            </span>
          ))}
        </div>

        {/* Checked-in indicator */}
        {booking.tickets.some((t: any) => t.checkedInCount > 0) && (
          <div className="mt-2 flex items-center gap-1.5 text-[9px] font-black text-[#C4F000]">
            <CheckCircle2 className="h-3 w-3" />
            {booking.tickets.reduce((s: number, t: any) => s + (t.checkedInCount || 0), 0)} checked in
          </div>
        )}
      </div>

      {/* ── Perforation line ── */}
      <div className="relative flex items-center bg-zinc-900">
        <div className="h-4 w-4 rounded-full bg-white dark:bg-background -ml-2 shrink-0 border border-zinc-200 dark:border-border/60" />
        <div className="flex-1 border-t-2 border-dashed border-zinc-700 dark:border-border/40" />
        <div className="h-4 w-4 rounded-full bg-white dark:bg-background -mr-2 shrink-0 border border-zinc-200 dark:border-border/60" />
      </div>

      {/* ── Details ── */}
      <div className="px-5 py-4 flex-1 space-y-2.5 bg-white dark:bg-card">
        <div className="flex items-start gap-2.5">
          <Calendar className="h-3.5 w-3.5 text-[#C4F000] shrink-0 mt-0.5" />
          <span className="text-xs font-bold text-foreground/80">{dateStr}</span>
        </div>
        {event?.time && (
          <div className="flex items-start gap-2.5">
            <Clock className="h-3.5 w-3.5 text-[#C4F000] shrink-0 mt-0.5" />
            <span className="text-xs font-bold text-foreground/80">{event.time}</span>
          </div>
        )}
        <div className="flex items-start gap-2.5">
          <MapPin className="h-3.5 w-3.5 text-[#C4F000] shrink-0 mt-0.5" />
          <span className="text-xs font-bold text-foreground/80 line-clamp-1">
            {event?.location?.venueName || event?.location?.address || "Location unavailable"}
          </span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="px-5 pb-5 flex gap-2 pt-1 bg-white dark:bg-card border-t border-zinc-100 dark:border-border/20">
        {/* QR Code */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="h-9 w-9 rounded-xl bg-[#C4F000]/10 hover:bg-[#C4F000]/20 border border-[#C4F000]/20 flex items-center justify-center transition-colors shrink-0">
              <QrCode className="h-4 w-4 text-[#C4F000]" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm rounded-2xl border-border">
            <DialogHeader>
              <DialogTitle className="text-center font-black tracking-tight">Scan at Entry</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center py-4 space-y-5">
              <div className="bg-white p-5 rounded-2xl shadow-lg border-4 border-[#C4F000]/30">
                <QRCodeSVG
                  value={`citypulse://ticket/${booking._id}`}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="font-black text-base tracking-tight">{event?.title || "Event"}</p>
                <p className="text-xs text-muted-foreground">Show this to staff at the entrance</p>
              </div>
              <div className="w-full bg-muted/40 rounded-xl p-4 space-y-3 border border-border/40">
                {booking.tickets.map((t: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="font-black text-xs uppercase tracking-wider">{t.type} ×{t.quantity}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      t.checkedInCount >= t.quantity
                        ? "bg-[#C4F000]/15 text-[#C4F000]"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {t.checkedInCount}/{t.quantity} scanned
                    </span>
                  </div>
                ))}
                {event && (
                  <div className="pt-2 border-t border-border/40 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Add to Calendar</p>
                    <div className="flex justify-center">
                      <AddToCalendarButton
                        name={event.title}
                        options={["Google", "Apple", "Outlook.com"]}
                        location={event.location?.address}
                        startDate={event.date?.split("T")[0]}
                        startTime={event.time}
                        description={`Your tickets for ${event.title}`}
                        timeZone="Asia/Kolkata"
                        buttonStyle="round"
                        label="Add to Calendar"
                        size="small"
                        lightMode="system"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Details */}
        <Link to={`/events/${event?._id}`} className="flex-1">
          <button className="w-full h-9 rounded-xl border border-zinc-200 dark:border-border/60 bg-zinc-50 dark:bg-muted/30 hover:bg-zinc-100 dark:hover:bg-muted/60 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Details
          </button>
        </Link>

        {/* Download */}
        {!isPast && (
          <button
            onClick={onDownload}
            disabled={isLoading}
            className="flex-1 h-9 rounded-xl bg-[#C4F000] text-black text-xs font-black uppercase tracking-wider hover:bg-[#A3C800] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {isLoading ? (
              <div className="h-3.5 w-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default MyTickets;
