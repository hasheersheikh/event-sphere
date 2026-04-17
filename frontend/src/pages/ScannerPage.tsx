import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle,
  XCircle,
  Camera,
  RefreshCw,
  ArrowLeft,
  Zap,
  ZapOff,
  Maximize2,
  Lock,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ScannerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const init = async () => {
      await startScanner();
    };
    init();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      await stopScanner();
      await new Promise(resolve => setTimeout(resolve, 300));

      const readerElement = document.getElementById("reader");
      if (readerElement) {
        readerElement.innerHTML = "";
      }

      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 20,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure,
      );
    } catch (err) {
      setError("Failed to initialize optics. Camera access required.");
      toast.error("Optics initialization failed");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
    }
  };

  const toggleTorch = async () => {
    if (html5QrCodeRef.current) {
      try {
        const newState = !isTorchOn;
        await html5QrCodeRef.current.applyVideoConstraints({
          //@ts-ignore
          advanced: [{ torch: newState }],
        });
        setIsTorchOn(newState);
      } catch (e) {
        toast.info("Torch control not supported on this unit.");
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (!decodedText.startsWith("citypulse://ticket/")) {
      toast.error("Invalid frequency detected.");
      return;
    }

    const bookingId = decodedText.replace("citypulse://ticket/", "");
    setIsScanning(false);
    setIsLoading(true);
    await stopScanner();

    // Trigger Haptics
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    try {
      const { data: result } = await api.patch(
        `/bookings/${bookingId}/check-in`,
        { ticketType: "General Admission" }, // Fallback, ideally should handle selection if multiple
      );
      setScanResult(result);
      toast.success("Identity Verified.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Security clearance denied.");
      toast.error("Clearance Denied");
    } finally {
      setIsLoading(false);
    }
  };

  const onScanFailure = (error: any) => {
    // Silent
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(true);
    startScanner();
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col overflow-hidden z-[9999]">
      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="scanner-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex-1 flex flex-col"
          >
            {/* Header / Navigation */}
            <header className="h-20 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-6 z-20">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-sm font-black uppercase tracking-widest text-white leading-none">
                    Scanner <span className="text-emerald-500">Hub.</span>
                  </h1>
                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                    Secure Entry Node
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button
                  onClick={toggleTorch}
                  className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-all ${isTorchOn ? "bg-orange-500 border-none text-black" : "bg-white/5 border-white/10 text-white/60"}`}
                >
                  {isTorchOn ? <Zap className="h-4 w-4 fill-current" /> : <ZapOff className="h-4 w-4" />}
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {isTorchOn ? "Torch On" : "Torch Off"}
                  </span>
                </button>
              </div>
            </header>

            {/* Camera View Container */}
            <div className="flex-1 relative bg-zinc-950 flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-[320px] aspect-square relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl bg-black">
                <div id="reader" className="absolute inset-0 z-0 [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
                
                {/* Scanning UI Overlays */}
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white/10 relative">
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-500" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-500" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-500" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-500" />
                    
                    <motion.div
                      animate={{ top: ["10%", "90%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-4 right-4 h-0.5 bg-emerald-500/60 shadow-[0_0_15px_#10b981]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                  Align Ticket QR Protocol
                </p>
                <div className="flex items-center gap-3 justify-center bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    Optics Online / Scanning
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Status Panel */}
            <div className="h-24 bg-zinc-900 border-t border-white/5 px-8 flex items-center gap-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Maximize2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/90">
                  {user?.role === "volunteer" ? "Gate Access Control" : "Event Entry Node"}
                </h3>
                <p className="text-zinc-600 text-[9px] font-bold italic mt-0.5">
                  {user?.role === "volunteer"
                    ? `Authorized Station: ${user.gate || "Primary ALPHA"}`
                    : "Synchronizing participant IDs in real-time."}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result-view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col p-8 items-center justify-center text-center space-y-12"
          >
            {isLoading ? (
              <div className="space-y-6">
                <div className="h-20 w-20 border-t-4 border-emerald-500 rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">
                  Decrypting Frequency...
                </p>
              </div>
            ) : scanResult ? (
              <>
                <div className="space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-32 w-32 rounded-full bg-emerald-500/10 border-4 border-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                  >
                    <CheckCircle className="h-16 w-16 text-emerald-500" />
                  </motion.div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black brand-font tracking-tighter uppercase text-emerald-400 italic">
                      Clearance Granted.
                    </h2>
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">
                      Identity Protocol Verified
                    </p>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="bg-white/5 border border-white/10 p-8 text-left space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 italic">
                        Authorized Participant
                      </p>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">
                        {scanResult.booking.userName}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">
                          Access Tier
                        </p>
                        <p className="text-xs font-black uppercase text-emerald-500">
                          {scanResult.booking.ticketType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">
                          Scan Index
                        </p>
                        <p className="text-xs font-black uppercase tabular-nums">
                          {scanResult.booking.checkedInCount} /{" "}
                          {scanResult.booking.totalQuantity}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>

                <Button
                  onClick={resetScanner}
                  className="w-full h-16 rounded-none bg-emerald-500 text-black hover:bg-emerald-400 font-black uppercase tracking-[0.3em] text-xs shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                  Scan Next Unit
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="h-32 w-32 rounded-full bg-rose-500/10 border-4 border-rose-500 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(244,63,94,0.3)]">
                    <XCircle className="h-16 w-16 text-rose-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black brand-font tracking-tighter uppercase text-rose-500 italic">
                      Access Revoked.
                    </h2>
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest italic">
                      {error || "Security Clearance Denied"}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={resetScanner}
                  className="w-full h-16 rounded-none bg-rose-500 text-white hover:bg-rose-600 font-black uppercase tracking-[0.3em] text-xs"
                >
                  Retry Scan
                </Button>
              </>
            )}

            <button
              onClick={() => navigate(-1)}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
            >
              Abandon Post
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScannerPage;
