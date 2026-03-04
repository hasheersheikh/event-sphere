import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);

      // Check if already installed
      if (!window.matchMedia("(display-mode: standalone)").matches) {
        // Delay showing toast for better UX
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="bg-card/90 backdrop-blur-xl border border-primary/20 rounded-2xl p-5 shadow-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center shrink-0">
              <Download className="h-6 w-6 text-white" />
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-sm">Install City Pulse</h4>
              <p className="text-xs text-muted-foreground">
                Access tickets offline and scan faster
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={handleInstall}
                className="h-8 text-xs font-bold rounded-lg px-4"
              >
                Install
              </Button>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-[10px] text-muted-foreground hover:text-foreground text-center"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PwaInstallPrompt;
