import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { downloadTicketPdf } from "@/lib/downloadTicket";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Calendar, Clock, Building2, Mail, Phone,
  ChevronLeft, ArrowRight, Check, Plus, Minus, Ticket, Trash2, Download, Loader2
} from "lucide-react";
import { Event } from "@/types/event";
import { cn, formatEventDate } from "@/lib/utils";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export default function BookingModal({ isOpen, onClose, event }: BookingModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [sessionStep, setSessionStep] = useState(0); // 0: Date, 1: Slot (for recurring + slots)
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isFullPassSelected, setIsFullPassSelected] = useState(false);
  
  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState(user?.phoneNumber || "");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  // Set when a free booking is confirmed — swaps the modal to a success panel
  // with a ticket download (fallback for when the email never arrives).
  const [confirmedBooking, setConfirmedBooking] = useState<{ _id: string; downloadToken?: string | null } | null>(null);
  const [isDownloadingTicket, setIsDownloadingTicket] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (event.scheduleType === "single" || !event.scheduleType) {
        setStep(1);
      } else {
        setStep(0);
        setSessionStep(0);
      }
      setSelectedSlotIndex(null);
      setSelectedDateIndex(null);
      setSelectedDays([]);
      setIsFullPassSelected(false);
      setSelectedTicketType(null);
      setNumberOfPeople(1);
      setAppliedVoucher(null);
      setVoucherCode("");
      setConfirmedBooking(null);
      
      // Fetch global tax rate
      api.get("/bookings/tax-rate")
        .then(({ data }) => setTaxRate(data.taxRate || 0))
        .catch(() => setTaxRate(0));
    }
  }, [isOpen, event.scheduleType]);

  const handleApplyVoucher = async () => {
    setIsLoadingVoucher(true);
    try {
      const { data } = await api.post(`/events/${event._id}/vouchers/apply`, { code: voucherCode });
      setAppliedVoucher(data);
      toast.success("Voucher applied!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid voucher code");
    } finally {
      setIsLoadingVoucher(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpayPopup = async (booking: any) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load payment gateway. Please try again.");
      return;
    }

    try {
      const { data: orderData } = await api.post("/payments/create-order", {
        bookingId: booking._id,
        amount: booking.totalAmount,
        currency: "INR",
      });

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "City Pulse",
        description: `Booking for ${event.title}`,
        prefill: {
          name: guestName || "Guest",
          email: guestEmail,
          contact: guestPhone,
        },
        theme: { color: "#000000" },
        modal: { ondismiss: () => toast.error("Payment cancelled. Your booking is held for 60 minutes.") },
        handler: async (response: any) => {
          try {
            const { data } = await api.post("/payments/verify-order", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#ffffff", "#cccccc", "#888888"] });
            // Auto-download the ticket so a failed confirmation email doesn't
            // strand the buyer. Exactly one automatic attempt — browsers block
            // multiples — with the toast action as the manual fallback.
            const download = () =>
              downloadTicketPdf(booking._id, data?.downloadToken).catch((err: any) =>
                toast.error(err?.message || "Could not download ticket.")
              );
            download();
            toast.success("Payment successful! Your tickets are confirmed.", {
              action: { label: "Download", onClick: download },
            });
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
      };

      // Close the Dialog BEFORE opening Razorpay — Radix UI sets
      // pointer-events:none on <body> while any Dialog is mounted, which
      // blocks all clicks inside the Razorpay iframe.
      onClose();

      // Wait one tick for Radix cleanup, then force-restore pointer-events
      // in case the Dialog's unmount animation hasn't finished.
      await new Promise(r => setTimeout(r, 80));
      document.body.style.pointerEvents = "";

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  const bookingMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/bookings", payload);
      return data;
    },
    onSuccess: async (booking) => {
      if (booking.status === "confirmed") {
        // Free ticket — already confirmed on the backend. Keep the modal open
        // on a success panel so the ticket downloads to the device even when
        // the email never arrives.
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#ffffff", "#cccccc", "#888888"] });
        toast.success("Booking confirmed! Your tickets are on their way.");
        setConfirmedBooking({ _id: booking._id, downloadToken: booking.downloadToken });
        downloadTicketPdf(booking._id, booking.downloadToken).catch(() => {
          // Auto-download failed/blocked — the panel's Download button covers it.
        });
        return;
      }
      await openRazorpayPopup(booking);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Booking failed.");
    },
  });

  const handleDownloadConfirmedTicket = async () => {
    if (!confirmedBooking) return;
    setIsDownloadingTicket(true);
    try {
      await downloadTicketPdf(confirmedBooking._id, confirmedBooking.downloadToken ?? undefined);
    } catch (err: any) {
      toast.error(err?.message || "Could not download ticket.");
    } finally {
      setIsDownloadingTicket(false);
    }
  };

  const getTicketPrice = (ticket: any) => {
    let basePrice = ticket.price;
    if (event.scheduleType === "multi_day") {
      if (isFullPassSelected) {
        if (ticket.fullPassPrice !== undefined) {
          basePrice = ticket.fullPassPrice;
        } else {
          // No full pass price set — sum all days as fallback
          basePrice = 0;
          (event.days || []).forEach((_: any, idx: number) => {
            const dayPrice = ticket.dayWisePrices?.find((dp: any) => dp.dayIndex === idx)?.price;
            basePrice += dayPrice !== undefined ? dayPrice : ticket.price;
          });
        }
      } else if (selectedDays.length > 0) {
        basePrice = 0;
        selectedDays.forEach(idx => {
          const dayPrice = ticket.dayWisePrices?.find((dp: any) => dp.dayIndex === idx)?.price;
          basePrice += dayPrice !== undefined ? dayPrice : ticket.price;
        });
      }
    }
    return basePrice;
  };

  const calculateBookingAmounts = () => {
    if (!selectedTicketType) return { subtotal: 0, discount: 0, taxAmount: 0, total: 0 };
    const ticket = event.ticketTypes.find((t: any) => t.name === selectedTicketType);
    if (!ticket) return { subtotal: 0, discount: 0, taxAmount: 0, total: 0 };
    
    const subtotal = getTicketPrice(ticket) * numberOfPeople;
    let discount = 0;

    if (appliedVoucher && subtotal > 0) {
      if (appliedVoucher.discountType === "percentage") {
        discount = (subtotal * appliedVoucher.discountAmount / 100);
      } else {
        discount = appliedVoucher.discountAmount;
      }
    }
    
    const netAmount = Math.max(0, subtotal - discount);
    const taxAmount = Math.round(netAmount * (taxRate / 100));
    const total = netAmount + taxAmount;
    
    return { subtotal, discount, taxAmount, total };
  };

  const { subtotal, discount, taxAmount, total } = calculateBookingAmounts();

  const handleCheckout = () => {
    if (!guestEmail || !guestPhone) {
      toast.error("Email and Phone are required.");
      return;
    }

    if (!selectedTicketType || numberOfPeople === 0) {
      toast.error("Please select ticket type and number of people.");
      return;
    }

    const ticket = event.ticketTypes.find((t: any) => t.name === selectedTicketType);
    if (!ticket) return;

    const ticketsPayload = [{
      type: ticket.name,
      quantity: numberOfPeople,
      price: getTicketPrice(ticket),
      selectedDays: event.scheduleType === "multi_day" ? selectedDays : undefined,
      isFullPass: event.scheduleType === "multi_day" ? isFullPassSelected : undefined,
      selectedSlot: event.scheduleType === "multi_slot" && selectedSlotIndex !== null ? event.slots![selectedSlotIndex] : undefined,
      selectedDate: event.scheduleType === "recurring" && selectedDateIndex !== null ? recurringDates[selectedDateIndex].toISOString() : undefined,
    }];

    bookingMutation.mutate({
      eventId: event._id,
      tickets: ticketsPayload,
      email: guestEmail,
      phoneNumber: guestPhone,
      contactName: guestName || undefined,
      voucherCode: appliedVoucher?.code || undefined,
    });
  };

  // For API timestamps (event.date, day.date) whose UTC fields carry IST
  // wall-clock values — formatted in UTC so the stored day is shown as-is.
  const formatDate = (dateString: string) =>
    formatEventDate(dateString, { weekday: "short", month: "short", day: "numeric" });

  // For locally-built Date objects (recurring date picker) — render in the
  // browser's own timezone, matching how they were constructed.
  const formatLocalDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  
  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(price);
  };

  const recurringDates = React.useMemo(() => {
    if (event.scheduleType !== "recurring" || !event.recurrence) return [];
    
    const { frequency, daysOfWeek, endDate, exceptions } = event.recurrence;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only show booking for 2 weeks from today date
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    // Start from either today or event start date, whichever is later
    const startDate = new Date(event.date);
    const current = new Date(startDate < today ? today : startDate);
    
    // End is either endDate or two weeks from now, whichever is sooner
    const end = endDate ? (new Date(endDate) < twoWeeksFromNow ? new Date(endDate) : twoWeeksFromNow) : twoWeeksFromNow;
    
    const dates: Date[] = [];
    
    // Safety cap to avoid infinite loops
    while (current <= end && dates.length < 50) {
      const isException = exceptions?.some(ex => new Date(ex).toDateString() === current.toDateString());
      
      if (!isException) {
        if (frequency === 'daily') {
          dates.push(new Date(current));
        } else if (frequency === 'weekly' && daysOfWeek?.includes(current.getDay())) {
          dates.push(new Date(current));
        }
      }
      
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [event]);

  const canProceedFromSession = () => {
    if (event.scheduleType === "single") return true;
    if (event.scheduleType === "multi_slot") return selectedSlotIndex !== null;
    if (event.scheduleType === "multi_day") return isFullPassSelected || selectedDays.length > 0;
    if (event.scheduleType === "recurring") {
      if (event.slots && event.slots.length > 0) {
        return selectedDateIndex !== null && selectedSlotIndex !== null;
      }
      return selectedDateIndex !== null;
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-2xl bg-card border-border/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-muted/30 border-b border-border/30 p-5 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            {!confirmedBooking && (step > (event.scheduleType === "single" || !event.scheduleType ? 1 : 0) || (step === 0 && sessionStep === 1)) && (
              <button 
                onClick={() => {
                  if (step === 0 && sessionStep === 1) setSessionStep(0);
                  else setStep(step - 1);
                }} 
                className="h-8 w-8 rounded-full bg-background border border-border/30 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">{event.title}</h2>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> {formatDate(event.date)}
              </p>
            </div>
          </div>

          {/* Timeline Stepper - No numbers (hidden on the success panel) */}
          <div className={cn("flex items-center px-4 mt-2", confirmedBooking && "hidden")}>
            {[
              { label: "Session", show: event.scheduleType && event.scheduleType !== "single", stepIndex: 0 },
              { label: "Quantity", show: true, stepIndex: 1 },
              { label: "Tickets", show: true, stepIndex: 2 },
              { label: "Details", show: true, stepIndex: 3 }
            ].filter(s => s.show).map((s, i, arr) => {
              const isActive = step === s.stepIndex;
              const isPast = step > s.stepIndex;
              
              return (
                <React.Fragment key={s.label}>
                  {i > 0 && (
                    <div className="flex-1 h-[2px] mx-2 bg-muted relative overflow-hidden rounded-full">
                      <div className={cn("absolute inset-0 bg-primary transition-all duration-500", isPast ? "w-full" : "w-0")} />
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2 min-w-[60px]">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2",
                      isActive ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110" : 
                      isPast ? "bg-primary border-primary text-primary-foreground" : "bg-card border-muted-foreground/30 text-muted-foreground"
                    )}>
                      {isPast ? <Check className="h-4 w-4" /> : null}
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hidden sm:block",
                      isActive ? "text-primary" : 
                      isPast ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {s.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="p-5 overflow-y-auto">

          {/* SUCCESS PANEL — free booking confirmed, ticket downloads here */}
          {confirmedBooking && (
            <div className="flex flex-col items-center text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-5">
                <Check className="h-8 w-8 text-primary-foreground" strokeWidth={3} />
              </div>
              <h3 className="font-display font-extrabold text-2xl tracking-tighter mb-2">Booking Confirmed!</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-1">
                Your ticket is downloading and is also on its way to your email.
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Booking #{confirmedBooking._id.slice(-8).toUpperCase()}
              </p>
            </div>
          )}

          {/* STEP 0: SESSION SELECTION */}
          {!confirmedBooking && step === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="font-extrabold text-lg mb-4">Select Session</h3>

              {event.scheduleType === "multi_day" && (
                <div className="space-y-3">
                  <div
                    onClick={() => {
                      const turningOn = !isFullPassSelected;
                      setIsFullPassSelected(turningOn);
                      if (turningOn) setSelectedDays([]);
                    }}
                    className={cn(
                      "p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-all",
                      isFullPassSelected ? "bg-primary/5 border-primary" : "bg-card border-border/30 hover:border-border"
                    )}
                  >
                    <div>
                      <span className="font-extrabold block">Full Event Pass</span>
                      <span className="text-xs text-muted-foreground font-medium">Access to all days</span>
                    </div>
                    <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", isFullPassSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30")}>
                      {isFullPassSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>

                  {!isFullPassSelected && event.days?.map((day, idx) => {
                    const isSelected = selectedDays.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isSelected) setSelectedDays(selectedDays.filter(d => d !== idx));
                          else setSelectedDays([...selectedDays, idx]);
                        }}
                        className={cn(
                          "p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-all",
                          isSelected ? "bg-primary/5 border-primary" : "bg-card border-border/30 hover:border-border"
                        )}
                      >
                        <div>
                          <span className="font-extrabold block">{day.title || `Day ${idx + 1}`}</span>
                          <span className="text-xs text-muted-foreground font-medium">{formatDate(day.date)} • {day.startTime} - {day.endTime}</span>
                        </div>
                        <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30")}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {event.scheduleType === "multi_slot" && (
                <div className="grid gap-3">
                  {event.slots?.map((slot, idx) => {
                    const isSelected = selectedSlotIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => !slot.isSoldOut && setSelectedSlotIndex(idx)}
                        className={cn(
                          "p-4 rounded-xl border-2 flex justify-between items-center transition-all",
                          slot.isSoldOut ? "opacity-50 grayscale cursor-not-allowed bg-muted/30 border-border/20" : "cursor-pointer",
                          isSelected ? "bg-primary/5 border-primary" : "bg-card border-border/30 hover:border-border",
                          !slot.isSoldOut && !isSelected && "hover:border-border"
                        )}
                      >
                        <div>
                          <span className="font-extrabold block">{slot.label || `Slot ${idx + 1}`}</span>
                          <span className="text-xs text-muted-foreground font-medium">{slot.startTime} {slot.endTime ? `- ${slot.endTime}` : ""}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {slot.isSoldOut && <span className="text-[10px] font-bold text-destructive uppercase tracking-widest">Sold Out</span>}
                          {!slot.isSoldOut && (
                            <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30")}>
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {event.scheduleType === "recurring" && (
                <div className="space-y-4">
                  {sessionStep === 0 ? (
                    <div className="grid gap-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Pick a Date</p>
                      {recurringDates.map((date, idx) => {
                        const isSelected = selectedDateIndex === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedDateIndex(idx);
                              if (event.slots && event.slots.length > 0) setSessionStep(1);
                            }}
                            className={cn(
                              "p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-all",
                              isSelected ? "bg-primary/5 border-primary" : "bg-card border-border/30 hover:border-border"
                            )}
                          >
                            <div>
                              <span className="font-extrabold block">{formatLocalDate(date)}</span>
                            </div>
                            <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30")}>
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pick a Slot</p>
                        <button onClick={() => setSessionStep(0)} className="text-[10px] font-bold uppercase text-primary hover:underline">Change Date</button>
                      </div>
                      {event.slots?.map((slot, idx) => {
                        const isSelected = selectedSlotIndex === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => !slot.isSoldOut && setSelectedSlotIndex(idx)}
                            className={cn(
                              "p-4 rounded-xl border-2 flex justify-between items-center transition-all",
                              slot.isSoldOut ? "opacity-50 grayscale cursor-not-allowed bg-muted/30 border-border/20" : "cursor-pointer",
                              isSelected ? "bg-primary/5 border-primary" : "bg-card border-border/30 hover:border-border"
                            )}
                          >
                            <div>
                              <span className="font-extrabold block">{slot.label || `Slot ${idx + 1}`}</span>
                              <span className="text-xs text-muted-foreground font-medium">{slot.startTime} {slot.endTime ? `- ${slot.endTime}` : ""}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {slot.isSoldOut && <span className="text-[10px] font-bold text-destructive uppercase tracking-widest">Sold Out</span>}
                              {!slot.isSoldOut && (
                                <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30")}>
                                  {isSelected && <Check className="h-3 w-3" />}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 1: NUMBER OF PEOPLE */}
          {!confirmedBooking && step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="font-display font-extrabold text-2xl tracking-tighter">How many people?</h3>
              
              <div className="flex items-center justify-center gap-6 py-8">
                <button
                  onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                  disabled={numberOfPeople <= 1}
                  className="h-14 w-14 rounded-2xl bg-muted/50 hover:bg-muted flex items-center justify-center text-foreground disabled:opacity-30 transition-all disabled:hover:scale-100 hover:scale-105"
                >
                  <Minus className="h-6 w-6" />
                </button>
                <div className="text-center min-w-[120px]">
                  <p className="font-display font-extrabold text-5xl tracking-tighter">{numberOfPeople}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
                    {numberOfPeople === 1 ? "Person" : "People"}
                  </p>
                </div>
                <button
                  onClick={() => setNumberOfPeople(Math.min(numberOfPeople + 1, 10))}
                  disabled={numberOfPeople >= 10}
                  className="h-14 w-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TICKET TIER SELECTION */}
          {!confirmedBooking && step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="font-display font-extrabold text-2xl tracking-tighter mb-6">Select Ticket Type</h3>
              
              <div className="space-y-4">
                {event.ticketTypes.map((ticket: any) => {
                  const price = getTicketPrice(ticket);
                  const maxQty = ticket.capacity - (ticket.sold ?? 0);
                  const isSoldOut = ticket.isSoldOut || maxQty <= 0;
                  const isSelected = selectedTicketType === ticket.name;

                  return (
                    <div 
                      key={ticket.name} 
                      className={cn(
                        "relative p-5 rounded-2xl transition-all duration-300 border-2 overflow-hidden group cursor-pointer",
                        isSoldOut ? "opacity-50 grayscale bg-muted/30 border-border/20 cursor-not-allowed" : 
                        isSelected ? "border-neon-lime bg-neon-lime/[0.04] dark:bg-neon-lime/[0.02] shadow-[0_0_20px_hsl(var(--neon-lime)/0.25)]" : "border-border/40 bg-card hover:border-neon-lime/30 hover:shadow-lg"
                      )}
                      onClick={() => {
                        if (isSoldOut) return;
                        setSelectedTicketType(ticket.name);
                        if (numberOfPeople > maxQty) {
                          setNumberOfPeople(maxQty);
                          toast.error(`Only ${maxQty} ticket${maxQty !== 1 ? "s" : ""} remaining. Quantity adjusted.`);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                              isSelected ? "bg-neon-lime border-neon-lime text-black" : "border-muted-foreground/30"
                            )}>
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className={cn(
                              "font-display font-extrabold text-lg tracking-tighter transition-colors",
                              isSelected ? "text-green-700 dark:text-neon-lime" : "text-foreground"
                            )}>
                              {ticket.name}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-bold uppercase tracking-widest bg-neon-lime/15 text-green-700 dark:text-neon-lime px-2 py-0.5 rounded-full border border-neon-lime/30 animate-pulse">
                                Selected
                              </span>
                            )}
                          </div>
                          {ticket.description && (
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[280px] block mt-2 ml-8">{ticket.description}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className={cn(
                            "font-display font-extrabold text-2xl tracking-tighter transition-colors",
                            isSelected ? "text-green-700 dark:text-neon-lime" : "text-foreground"
                          )}>
                            {formatPrice(price)}
                          </span>
                        </div>
                      </div>

                      {!isSoldOut && (
                        <div className="flex items-center justify-between mt-4 ml-8 pt-3 border-t border-border/30">
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest", isSelected ? "text-green-600 dark:text-neon-lime font-bold" : "text-muted-foreground")}>
                            {maxQty} remaining
                          </span>
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest", isSelected ? "text-foreground font-bold" : "text-muted-foreground")}>
                            {formatPrice(price)} × {numberOfPeople} = {formatPrice(price * numberOfPeople)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CHECKOUT DETAILS */}
          {!confirmedBooking && step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="font-display font-extrabold text-2xl tracking-tighter">Contact Details</h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                    <Building2 className="h-3.5 w-3.5" /> Full Name
                  </Label>
                  <Input placeholder="John Doe" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="h-14 rounded-2xl bg-muted/30 border-border/50 text-base px-4 focus-visible:ring-primary/50 focus-visible:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </Label>
                  <Input type="email" placeholder="john@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="h-14 rounded-2xl bg-muted/30 border-border/50 text-base px-4 focus-visible:ring-primary/50 focus-visible:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                    <Phone className="h-3.5 w-3.5" /> Phone Number
                  </Label>
                  <div className="flex gap-2 items-center">
                    <div className="h-14 px-4 flex items-center justify-center rounded-2xl bg-muted/30 border border-border/50 text-sm font-bold text-foreground shrink-0 select-none">
                      +91
                    </div>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      value={guestPhone ? guestPhone.replace(/^\+91/, "") : ""}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setGuestPhone(digits ? "+91" + digits : "");
                      }}
                      className="h-14 rounded-2xl bg-muted/30 border-border/50 text-base px-4 focus-visible:ring-primary/50 focus-visible:border-primary transition-all flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/30 mt-6">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
                  <Ticket className="h-3 w-3" /> Promo Code
                </Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter code"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="h-12 rounded-xl bg-muted/30 uppercase font-bold tracking-wider border-border/50 focus-visible:ring-primary/50"
                    disabled={!!appliedVoucher}
                  />
                  {appliedVoucher ? (
                    <Button variant="outline" onClick={() => { setAppliedVoucher(null); setVoucherCode(""); }} className="h-12 px-5 rounded-xl text-destructive hover:bg-destructive/10 border-destructive/20 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={handleApplyVoucher} disabled={!voucherCode || isLoadingVoucher} className="h-12 px-6 rounded-xl font-bold tracking-wide shrink-0 bg-primary/10 text-primary hover:bg-primary/20">
                      Apply
                    </Button>
                  )}
                </div>
                {appliedVoucher && (
                  <p className="text-xs font-bold text-primary flex items-center gap-1.5 ml-1 mt-2">
                    <Check className="h-3.5 w-3.5" /> Promo code applied successfully!
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-muted/30 border-t border-border/40 p-5 sm:p-6 shrink-0 relative overflow-hidden">
          {/* Subtle gradient glow in footer */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          {confirmedBooking && (
            <div className="space-y-3 relative z-10">
              <Button
                className="w-full h-14 rounded-2xl font-extrabold uppercase tracking-widest text-xs shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300"
                disabled={isDownloadingTicket}
                onClick={handleDownloadConfirmedTicket}
              >
                {isDownloadingTicket ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isDownloadingTicket ? "Preparing ticket..." : "Download Ticket"}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-xs"
                onClick={() => {
                  setConfirmedBooking(null);
                  onClose();
                }}
              >
                Done
              </Button>
            </div>
          )}

          {!confirmedBooking && step === 0 && (
            <Button
              className="w-full h-14 rounded-2xl font-extrabold uppercase tracking-widest text-xs shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300"
              disabled={!canProceedFromSession()}
              onClick={() => {
                if (event.scheduleType === "recurring" && event.slots && event.slots.length > 0 && sessionStep === 0) {
                  setSessionStep(1);
                } else {
                  setStep(1);
                }
              }}
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {!confirmedBooking && step === 1 && (
            <Button
              className="w-full h-14 rounded-2xl font-extrabold uppercase tracking-widest text-xs shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300"
              onClick={() => setStep(2)}
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {!confirmedBooking && step === 2 && (
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Total</p>
                <p className="font-display font-extrabold text-3xl leading-none tracking-tighter">{formatPrice(total)}</p>
              </div>
              <Button 
                className="h-14 px-8 rounded-2xl font-extrabold uppercase tracking-widest text-xs shrink-0 shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                disabled={!selectedTicketType}
                onClick={() => setStep(3)}
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {!confirmedBooking && step === 3 && (
            <div className="space-y-5 relative z-10">
              <div className="space-y-5 relative z-10">
                <div className="bg-card border-2 border-primary/20 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subtotal</span>
                    <span className="font-bold text-sm">{formatPrice(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-primary">
                      <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Check className="h-3 w-3" /> Discount ({appliedVoucher?.code})
                      </span>
                      <span className="font-bold text-sm">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  {taxAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Tax ({taxRate}%)
                      </span>
                      <span className="font-bold text-sm">{formatPrice(taxAmount)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/50 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest">Total Payable</span>
                    <span className="font-display font-extrabold text-2xl tracking-tighter text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="px-1 text-center">
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                    By clicking "Pay Securely", you agree to the <span className="text-foreground font-bold cursor-help border-b border-dotted border-muted-foreground/50">Terms & Conditions</span> of this event and our platform.
                  </p>
                </div>
                <Button 
                  className="w-full h-14 rounded-2xl font-extrabold uppercase tracking-widest text-sm shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                  disabled={!guestEmail || !guestPhone || bookingMutation.isPending}
                  onClick={handleCheckout}
                >
                  {bookingMutation.isPending ? "Processing securely..." : "Pay Securely"}
                </Button>
              </div>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
