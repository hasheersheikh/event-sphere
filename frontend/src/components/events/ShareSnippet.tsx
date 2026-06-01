import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  X, 
  MessageCircle, 
  Instagram, 
  Copy, 
  Check
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Event {
  title: string;
  date: string;
  nextOccurrence?: string;
  time?: string;
  location: {
    venueName?: string;
    address: string;
  };
  image?: string;
}

interface ShareSnippetProps {
  event: Event;
  onClose: () => void;
}

const ShareSnippet = ({ event, onClose }: ShareSnippetProps) => {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    const formattedDate = getFormattedDate();
    const locationStr = event.location.venueName || event.location.address;
    const eventUrl = window.location.href;
    return `I'm going to "${event.title}"! 🎉\n\n📅 ${formattedDate}\n📍 ${locationStr}\n\nBook your tickets now on City Pulse: ${eventUrl}`;
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(getShareText())}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Opening WhatsApp...");
  };

  const handleInstagramShare = async () => {
    // Copy the complete invitation text including the link to the clipboard
    await navigator.clipboard.writeText(getShareText());
    toast.success("Details and event link copied! Paste in your Instagram story.");

    // Open Instagram
    window.open("https://www.instagram.com/", "_blank");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Event link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const getFormattedDate = () => {
    try {
      const dateToUse = event.nextOccurrence || event.date;
      if (!dateToUse) return "Upcoming Event";
      const parsedDate = new Date(dateToUse);
      if (isNaN(parsedDate.getTime())) return String(dateToUse);
      
      const mainDate = parsedDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return event.time ? `${mainDate} at ${event.time}` : mainDate;
    } catch {
      return "Upcoming Event";
    }
  };

  const displayLocation = event.location.venueName || event.location.address;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative max-w-3xl w-full bg-background text-foreground rounded-[2rem] shadow-2xl overflow-hidden border border-border flex flex-col md:flex-row my-8 min-h-[440px]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground hover:bg-muted transition-colors shadow-lg"
          title="Close Dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Column: Enlarged Image (Story Card) Outlined Flush to Borders */}
        <div className="w-full md:w-[48%] aspect-[4/5] relative overflow-hidden border-b md:border-b-0 md:border-r border-border select-none">
          <div className="w-full h-full p-6 flex flex-col justify-end relative bg-card text-foreground">
            {/* Event Background Image */}
            {event.image && (
              <img
                src={event.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-100 dark:opacity-60 transition-opacity duration-300"
              />
            )}

            {/* Gradient Overlay responsive to light/dark themes */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent pointer-events-none dark:from-[#090D16] dark:via-[#090D16]/50" />

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col h-full justify-between">
              {/* Badge */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest shadow-lg select-none">
                  I'm Going! 🎉
                </span>
              </div>

              {/* Event Info Details */}
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black leading-tight uppercase tracking-tight line-clamp-3 select-none text-foreground italic drop-shadow-sm">
                  {event.title}
                </h2>

                <div className="p-3.5 rounded-xl space-y-2.5 bg-muted/80 backdrop-blur-sm border border-border">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="text-xs font-bold truncate text-foreground/90">
                      {getFormattedDate()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="text-xs font-bold truncate text-foreground/90">
                      {displayLocation}
                    </span>
                  </div>
                </div>

                {/* Card Footer Branding */}
                <div className="flex items-center justify-between pt-3 border-t border-border opacity-85 text-primary">
                  <span className="text-[8px] font-black uppercase tracking-[0.25em]">
                    CITY PULSE
                  </span>
                  <span className="text-[8px] font-black tracking-widest uppercase text-muted-foreground">
                    ES-7729
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Center-aligned Share Options */}
        <div className="w-full md:w-[52%] p-8 flex flex-col justify-center space-y-8 bg-card">
          {/* Header */}
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Share Event</h3>
            <p className="text-xs text-muted-foreground font-medium">
              Invite your friends and share details instantly across your networks.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Social Share Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 h-12 text-[11px] font-black uppercase tracking-wider rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 active:scale-95 transition-all shadow-sm shrink-0"
                title="Share on WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0" /> WhatsApp
              </button>

              <button
                onClick={handleInstagramShare}
                className="flex items-center justify-center gap-2 h-12 text-[11px] font-black uppercase tracking-wider rounded-xl bg-[#E1306C]/10 text-[#E1306C] border border-[#E1306C]/20 hover:bg-[#E1306C]/20 active:scale-95 transition-all shadow-sm shrink-0"
                title="Copy Details for Instagram"
              >
                <Instagram className="h-3.5 w-3.5 shrink-0" /> Instagram
              </button>

              <button
                onClick={handleCopyLink}
                className={cn(
                  "flex items-center justify-center gap-2 h-12 text-[11px] font-black uppercase tracking-wider rounded-xl border border-border shadow-sm transition-all bg-muted/30 text-foreground hover:bg-muted/60 active:scale-95 col-span-2",
                  copied && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-500"
                )}
                title="Copy URL link"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 shrink-0 text-foreground/70" /> Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShareSnippet;
