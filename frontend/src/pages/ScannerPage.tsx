import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "sonner";
import api from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Camera, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ScannerPage = () => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [isScanning]);

  const onScanSuccess = async (decodedText: string) => {
    // Expected format: eventsphere://ticket/BOOKING_ID
    if (!decodedText.startsWith("eventsphere://ticket/")) {
      toast.error("Invalid QR Code format");
      return;
    }

    const bookingId = decodedText.replace("eventsphere://ticket/", "");
    setIsScanning(false);
    
    try {
      // First, get the booking details to let the user select ticket type if multiple exist
      // For simplicity in this version, we'll try to check-in the first available ticket type
      const { data: booking } = await api.get(`/bookings`); // This is not ideal, should have getById
      // Actually, let's just use the check-in endpoint directly with the first ticket type for now
      // A real app would show a list of ticket types to check-in
      
      const { data: result } = await api.patch(`/bookings/${bookingId}/check-in`, {
        ticketType: "General Admission" // Hardcoded for now, ideally parsed or selected
      });

      setScanResult(result);
      toast.success("Check-in successful!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Check-in failed");
      toast.error("Check-in failed");
    }
  };

  const onScanFailure = (error: any) => {
    // Silently ignore failures to keep UI clean
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-lg py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Event Scanner</h1>
          <p className="text-muted-foreground">Scan tickets at the door for instant check-in</p>
        </div>

        <div className="relative aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div 
                key="scanner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                id="reader" 
                className="w-full h-full"
              />
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-card"
              >
                {scanResult ? (
                  <>
                    <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-green-500">Success!</h2>
                    <div className="text-center space-y-1 mb-8">
                      <p className="font-semibold text-lg">{scanResult.booking.userName}</p>
                      <p className="text-muted-foreground">{scanResult.booking.ticketType}</p>
                      <p className="text-sm font-mono bg-muted px-2 py-0.5 rounded text-primary">
                        Checked-in: {scanResult.booking.checkedInCount} / {scanResult.booking.totalQuantity}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                      <XCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-destructive">Error</h2>
                    <p className="text-center text-muted-foreground mb-8 max-w-xs">{error}</p>
                  </>
                )}

                <Button 
                  onClick={resetScanner} 
                  className="w-full py-6 rounded-2xl gap-2 text-lg shadow-button"
                >
                  <RefreshCw className="h-5 w-5" />
                  Scan Next
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
           <div className="flex flex-col items-center gap-2">
             <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
               <Camera className="h-5 w-5 text-muted-foreground" />
             </div>
             <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Camera Ready</span>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ScannerPage;
