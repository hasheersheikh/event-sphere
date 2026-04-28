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
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(snippetRef.current, {
        scale: 2, // High quality
        useCORS: true,
        backgroundColor: null,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Going-to-${event.title.replace(/\s+/g, "-")}.png`;
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
        className="relative max-w-sm w-full bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/30"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-md hover:bg-background transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          ref={snippetRef}
          className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-primary/10"
        >
          {event.image && (
            <img
              src={event.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          <div className="absolute inset-0 p-6 flex flex-col justify-end text-foreground">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 w-fit mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  I'm Going! 🎉
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black mb-4 leading-tight tracking-tight">
              {event.title}
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium truncate">
                  {event.location.venueName || event.location.address}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/30 flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                EVENT SPHERE
              </div>
              <div className="h-6 w-6 rounded-md bg-primary/20 backdrop-blur-sm border border-primary/20" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border-t border-border/30">
          <Button
            onClick={handleDownload}
            disabled={isCapturing}
            className="w-full gap-2 h-11 text-sm rounded-xl"
          >
            {isCapturing ? (
              "Generating..."
            ) : (
              <>
                <Download className="h-4 w-4" /> Download Share Image
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ShareSnippet;
