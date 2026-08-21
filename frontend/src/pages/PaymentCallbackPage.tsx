import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Download } from "lucide-react";
import api from "@/lib/api";
import { downloadTicketPdf } from "@/lib/downloadTicket";
import confetti from "canvas-confetti";

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("");
  // Set for event bookings so the ticket can be downloaded right here — the
  // confirmation email is not always delivered.
  const [ticketDownload, setTicketDownload] = useState<{ bookingId: string; token?: string | null } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleDownloadTicket = async () => {
    if (!ticketDownload) return;
    setIsDownloading(true);
    setDownloadError("");
    try {
      await downloadTicketPdf(ticketDownload.bookingId, ticketDownload.token ?? undefined);
    } catch (err: any) {
      setDownloadError(err?.message || "Could not download ticket. You can retry from My Tickets.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const verify = async () => {
      const bookingId = searchParams.get("bookingId");
      const orderIdsParam = searchParams.get("orderIds") || searchParams.get("orderId");
      const orderIds = orderIdsParam ? orderIdsParam.split(",").filter(Boolean) : [];
      const razorpay_payment_id = searchParams.get("razorpay_payment_id");
      const razorpay_payment_link_id = searchParams.get("razorpay_payment_link_id");
      const razorpay_payment_link_reference_id = searchParams.get("razorpay_payment_link_reference_id");
      const razorpay_payment_link_status = searchParams.get("razorpay_payment_link_status");
      const razorpay_signature = searchParams.get("razorpay_signature");

      if (!razorpay_payment_id || !razorpay_signature) {
        setStatus("failed");
        setMessage("Missing payment details. Please contact support.");
        return;
      }

      try {
        const payload = {
          razorpay_payment_id,
          razorpay_payment_link_id,
          razorpay_payment_link_reference_id,
          razorpay_payment_link_status,
          razorpay_signature,
        };

        let data: any;

        if (orderIds.length > 0) {
          // Store order payment (single store or multi-store cart)
          const res = await api.post("/payments/verify-store-order", { ...payload, orderIds });
          data = res.data;
        } else if (bookingId) {
          // Event booking payment
          const res = await api.post("/payments/verify-link", { ...payload, bookingId });
          data = res.data;
        } else {
          setStatus("failed");
          setMessage("Missing order reference. Please contact support.");
          return;
        }

        if (data.success) {
          setStatus("success");
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#f59e0b", "#10b981", "#ffffff"],
          });
          if (bookingId) {
            // Auto-redirect is skipped for event bookings so the Download
            // Ticket button below stays reachable.
            setTicketDownload({ bookingId, token: data.downloadToken });
          } else {
            setTimeout(() => navigate("/my-orders"), 3000);
          }
        } else {
          setStatus("failed");
          setMessage(data.message || "Payment verification failed.");
        }
      } catch (err: any) {
        setStatus("failed");
        setMessage(err.response?.data?.message || "Payment verification failed. Please contact support.");
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm w-full">
        {status === "verifying" && (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Confirming Payment</h1>
            <p className="text-muted-foreground text-sm">Please wait while we verify your payment...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground text-sm mb-8">
              {ticketDownload
                ? "Your booking is confirmed. Download your ticket below — it's also on its way to your email."
                : "Your order has been confirmed. Redirecting..."}
            </p>
            {ticketDownload ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDownloadTicket}
                  disabled={isDownloading}
                  className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isDownloading ? "Preparing ticket..." : "Download Ticket"}
                </button>
                <button
                  onClick={() => navigate("/my-tickets")}
                  className="h-12 px-8 rounded-2xl border border-border bg-card text-foreground font-black uppercase tracking-widest text-[10px]"
                >
                  View My Tickets
                </button>
                {downloadError && (
                  <p className="text-destructive text-xs font-medium">{downloadError}</p>
                )}
              </div>
            ) : null}
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Payment Failed</h1>
            <p className="text-muted-foreground text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px]"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
