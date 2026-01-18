import { motion } from "framer-motion";
import { Calendar, MapPin, Share2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface ShareSnippetProps {
  event: any;
  onClose: () => void;
}

const ShareSnippet = ({ event, onClose }: ShareSnippetProps) => {
  const snippetRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleDownload = async () => {
    if (!snippetRef.current) return;
    setIsCapturing(true);
    
    try {
      // Small delay to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(snippetRef.current, {
        scale: 2, // High quality
        useCORS: true,
        backgroundColor: null,
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Going-to-${event.title.replace(/\s+/g, '-')}.png`;
      link.click();
      toast.success("Share snippet downloaded! Share it on your stories.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate share image.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-sm w-full bg-card rounded-3xl shadow-2xl overflow-hidden border border-primary/20"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 backdrop-blur-md hover:bg-background transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* The Actual Shareable Part */}
        <div ref={snippetRef} className="aspect-[9/16] relative overflow-hidden bg-foreground">
          {event.image ? (
            <img src={event.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 gradient-hero opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/20 to-transparent" />
          
          <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end min-h-unit-24 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary mb-6 w-fit text-sm font-bold uppercase tracking-wider">
              I'm Going! 🎟️
            </div>
            
            <h2 className="text-4xl font-extrabold mb-6 leading-tight">
              {event.title}
            </h2>
            
            <div className="space-y-4 mb-8 opacity-90">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="text-lg font-medium">{new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-primary" />
                <span className="text-lg font-medium truncate">{event.location.venueName || event.location.address}</span>
              </div>
            </div>

            <div className="pt-8 border-t border-white/20 flex items-center justify-between">
              <div className="text-sm font-bold tracking-widest text-white/60">
                EVENT SPHERE
              </div>
              <div className="h-8 w-8 rounded-lg bg-primary/20 backdrop-blur-sm border border-white/20" />
            </div>
          </div>
        </div>

        {/* Action Button (Not part of the image) */}
        <div className="p-6 bg-card">
          <Button onClick={handleDownload} disabled={isCapturing} className="w-full gap-2 h-12 text-lg rounded-2xl shadow-button">
            {isCapturing ? "Generating..." : <><Download className="h-5 w-5" /> Download Story Image</>}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Perfect for Instagram, WhatsApp, or Twitter stories!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ShareSnippet;
