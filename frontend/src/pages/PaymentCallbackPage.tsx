import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import confetti from "canvas-confetti";

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const bookingId = searchParams.get("bookingId");
      const razorpay_payment_id = searchParams.get("razorpay_payment_id");
      const razorpay_payment_link_id = searchParams.get("razorpay_payment_link_id");
      const razorpay_payment_link_reference_id = searchParams.get("razorpay_payment_link_reference_id");
      const razorpay_payment_link_status = searchParams.get("razorpay_payment_link_status");
      const razorpay_signature = searchParams.get("razorpay_signature");

      if (!bookingId || !razorpay_payment_id || !razorpay_signature) {
        setStatus("failed");
        setMessage("Missing payment details. Please contact support.");
        return;
      }

      try {
        const { data } = await api.post("/payments/verify-link", {
          bookingId,
          razorpay_payment_id,
          razorpay_payment_link_id,
          razorpay_payment_link_reference_id,
          razorpay_payment_link_status,
          razorpay_signature,
        });

        if (data.success) {
          setStatus("success");
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#6366f1", "#ec4899", "#ffffff"] });
          setTimeout(() => navigate("/my-tickets"), 3000);
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
      <div className="text-center max-w-sm">
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
            <p className="text-muted-foreground text-sm">Your tickets have been confirmed. Redirecting to your tickets...</p>
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
