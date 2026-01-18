import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Ticket, Calendar, MapPin, Download, ExternalLink, Clock } from "lucide-react";
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, CheckCircle2, Share2, CalendarPlus } from "lucide-react";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import { formatPrice } from "@/lib/utils";
import ShareSnippet from "@/components/events/ShareSnippet";

const MyTickets = () => {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [activeDownloadBooking, setActiveDownloadBooking] = useState<any>(null);

  const [selectedBookingForQR, setSelectedBookingForQR] = useState<any>(null);
  const [shareEvent, setShareEvent] = useState<any>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings');
      return data;
    }
  });

  const activeTickets = bookings?.filter((b: any) => b.status === 'confirmed' || b.status === 'pending') || [];
  const pastTickets = bookings?.filter((b: any) => b.status === 'expired' || b.status === 'cancelled' || b.status === 'refunded') || [];

  const handleDownload = async (booking: any) => {
    setIsDownloading(booking._id);
    setActiveDownloadBooking(booking);
    
    // Wait for the template to render
    setTimeout(async () => {
      try {
        const element = ticketRef.current;
        if (!element) throw new Error("Template not found");

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [800, 500]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, 800, 500);
        pdf.setProperties({
          title: `EventSphere-Ticket-${booking._id}`,
          subject: 'Event Admission Ticket',
          author: 'Event Sphere',
          creator: 'Event Sphere Portal'
        });
        
        pdf.save(`Ticket-${booking.event.title.replace(/\s+/g, '-')}.pdf`);
        toast.success("Ticket downloaded successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to generate PDF ticket.");
      } finally {
        setIsDownloading(null);
        setActiveDownloadBooking(null);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground text-lg">Manage and view your event tickets</p>
        </header>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border p-6 space-y-4">
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-6 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="pt-4 flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="pt-4 flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Active Tickets */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Active Tickets ({activeTickets.length})
              </h2>
              
              {activeTickets.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeTickets.map((booking: any) => (
                    <TicketCard 
                      key={booking._id} 
                      booking={booking} 
                      onDownload={() => handleDownload(booking)}
                      onShare={() => setShareEvent(booking.event)}
                      isLoading={isDownloading === booking._id}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-background rounded-2xl border border-dashed p-12 text-center shadow-sm">
                  <Ticket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active tickets</h3>
                  <p className="text-muted-foreground mb-6">You don't have any upcoming events at the moment.</p>
                  <Link to="/events">
                    <Button variant="default">Browse Events</Button>
                  </Link>
                </div>
              )}
            </section>

            {/* Past/Expired Tickets */}
            {pastTickets.length > 0 && (
              <section className="opacity-70 grayscale-[0.2]">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Past & Expired Tickets
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastTickets.map((booking: any) => (
                    <TicketCard 
                      key={booking._id} 
                      booking={booking} 
                      isPast 
                      onDownload={() => handleDownload(booking)}
                      onShare={() => setShareEvent(booking.event)}
                      isLoading={isDownloading === booking._id}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {shareEvent && (
        <ShareSnippet 
          event={shareEvent} 
          onClose={() => setShareEvent(null)} 
        />
      )}

      <Footer />

      {/* Hidden container for PDF capture */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        {activeDownloadBooking && activeDownloadBooking.tickets.map((t: any, idx: number) => (
          <div key={`${activeDownloadBooking._id}-${idx}`}>
            <TicketTemplate 
              ref={ticketRef} 
              booking={activeDownloadBooking} 
              ticket={t} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const TicketCard = ({ 
  booking, 
  isPast, 
  onDownload,
  onShare,
  isLoading
}: { 
  booking: any, 
  isPast?: boolean,
  onDownload?: () => void,
  onShare?: () => void,
  isLoading?: boolean
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card border overflow-hidden flex flex-col"
    >
      <div className={`p-1 text-center text-[10px] font-bold uppercase tracking-wider ${isPast ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
        {booking.status === 'confirmed' ? 'Valid Ticket' : booking.status}
      </div>
      <div className="p-6 flex-1">
        <h3 className="font-bold text-lg mb-4 line-clamp-1 group-hover:text-primary transition-colors">{booking.event.title}</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span>{new Date(booking.event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="line-clamp-1">{booking.event.location.venueName || booking.event.location.address}</span>
          </div>
        </div>

        <div className="pt-4 border-t flex flex-wrap gap-2">
          {booking.tickets.map((t: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 font-semibold">
                {t.quantity}x {t.type}
              </Badge>
              {t.checkedInCount > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  {t.checkedInCount} IN
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/50 p-4 flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-primary/20 hover:border-primary/50 text-primary">
              <QrCode className="h-4 w-4" />
              View QR
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Ticket QR Code</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-primary/10">
                <QRCodeSVG 
                  value={`eventsphere://ticket/${booking._id}`} 
                  size={240}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-xl">{booking.event.title}</p>
                <p className="text-muted-foreground">Show this code to the event organizer at the door.</p>
              </div>
              <div className="w-full bg-muted/50 p-4 rounded-xl space-y-4">
                {booking.tickets.map((t: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{t.type} (x{t.quantity})</span>
                    <Badge variant={t.checkedInCount >= t.quantity ? "success" : "secondary"}>
                      {t.checkedInCount} / {t.quantity} Scanned
                    </Badge>
                  </div>
                ))}

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3 text-center">Sync to your calendar</p>
                  <div className="flex justify-center">
                    <AddToCalendarButton
                      name={booking.event.title}
                      options={['Google', 'Apple', 'Outlook.com']}
                      location={booking.event.location.address}
                      startDate={booking.event.date.split('T')[0]}
                      startTime={booking.event.time}
                      description={`Your tickets for ${booking.event.title}`}
                      timeZone="Asia/Kolkata"
                      buttonStyle="round"
                      label="Add to Calendar"
                      size="small"
                      lightMode="system"
                    />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 rounded-xl"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>

        <Link to={`/events/${booking.event._id}`} className="flex-1 min-w-[120px]">
          <Button variant="outline" size="sm" className="w-full gap-2 rounded-xl">
            <ExternalLink className="h-4 w-4" />
            Event Details
          </Button>
        </Link>
        {!isPast && (
          <Button 
            variant="default" 
            size="sm" 
            className="gap-2 rounded-xl shadow-button"
            onClick={onDownload}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Ticket
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default MyTickets;
