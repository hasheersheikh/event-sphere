import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Calendar, Clock, Building2, Mail, Phone,
  ChevronLeft, ArrowRight, Check, Plus, Minus, Ticket, Trash2
} from "lucide-react";
import { Event } from "@/types/event";
import { cn } from "@/lib/utils";

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
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isFullPassSelected, setIsFullPassSelected] = useState(false);
  
  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState(user?.phoneNumber || "");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (event.scheduleType === "single" || !event.scheduleType) {
        setStep(1);
      } else {
        setStep(0);
      }
      setSelectedSlotIndex(null);
      setSelectedDateIndex(null);
      setSelectedDays([]);
      setIsFullPassSelected(false);
      setSelectedTicketType(null);
      setNumberOfPeople(1);
      setAppliedVoucher(null);
      setVoucherCode("");
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

  const bookingMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/bookings", payload);
      return data;
    },
    onSuccess: async (booking) => {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#ffffff", "#cccccc", "#888888"] });
      
      try {
        const { data } = await api.post("/payments/create-payment-link", {
          bookingId: booking._id,
          amount: booking.totalAmount,
          currency: "INR",
          customerName: guestName || "Guest",
          customerEmail: guestEmail,
          customerPhone: guestPhone,
          eventTitle: event.title,
        });
        window.location.href = data.payment_url;
      } catch (error) {
        toast.error("Failed to initialize payment gateway.");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Booking failed.");
    },
  });

  const getTicketPrice = (ticket: any) => {
    let basePrice = ticket.price;
    if (event.scheduleType === "multi_day") {
      if (isFullPassSelected && ticket.fullPassPrice !== undefined) {
        basePrice = ticket.fullPassPrice;
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

  const calculateTotal = () => {
    if (!selectedTicketType) return 0;
    const ticket = event.ticketTypes.find((t: any) => t.name === selectedTicketType);
    if (!ticket) return 0;
    
    let total = getTicketPrice(ticket) * numberOfPeople;

    if (appliedVoucher && total > 0) {
      if (appliedVoucher.discountType === "percentage") {
        total = total - (total * appliedVoucher.discountAmount / 100);
      } else {
        total = total - appliedVoucher.discountAmount;
      }
    }
    return Math.max(0, total);
  };

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
      status: "pending",
    });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  
  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(price);
  };

  const recurringDates = React.useMemo(() => {
    if (event.scheduleType !== "recurring" || !event.recurrence) return [];
    
    const { frequency, daysOfWeek, endDate, exceptions } = event.recurrence;
    const startDate = new Date(event.date);
    const end = endDate ? new Date(endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days default
    
    const dates: Date[] = [];
    const current = new Date(startDate);
    
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
    if (event.scheduleType === "recurring") return selectedDateIndex !== null;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-2xl bg-card border-border/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-muted/30 border-b border-border/30 p-5 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            {step > (event.scheduleType === "single" || !event.scheduleType ? 1 : 0) && (
              <button 
                onClick={() => setStep(step - 1)} 
                className="h-8 w-8 rounded-full bg-background border border-border/30 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-black tracking-tight">{event.title}</h2>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> {formatDate(event.date)}
              </p>
            </div>
          </div>

          {/* Timeline Stepper - No numbers */}
          <div className="flex items-center px-4 mt-2">
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
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 border-2",
                      isActive ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-110" : 
                      isPast ? "bg-primary border-primary text-primary-foreground" : "bg-card border-muted-foreground/30 text-muted-foreground"
                    )}>
                      {isPast ? <Check className="h-4 w-4" /> : null}
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300 hidden sm:block",
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
          
          {/* STEP 0: SESSION SELECTION */}
          {step === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="font-extrabold text-lg mb-4">Select Session</h3>

              {event.scheduleType === "multi_day" && (
                <div className="space-y-3">
                  <div
                    onClick={() => { setIsFullPassSelected(!isFullPassSelected); setSelectedDays([]); }}
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
                <div className="grid gap-3">
                  {recurringDates.map((date, idx) => {
                    const isSelected = selectedDateIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDateIndex(idx)}
                        className={cn(
                          "p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-all",
                          isSelected ? "bg-primary/5 border-primary" : "bg-card border-border/30 hover:border-border"
                        )}
                      >
                        <div>
                          <span className="font-extrabold block">{formatDate(date.toISOString())}</span>
                        </div>
                        <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30")}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 1: NUMBER OF PEOPLE */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="font-display font-black text-2xl tracking-tight">How many people?</h3>
              
              <div className="flex items-center justify-center gap-6 py-8">
                <button
                  onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                  disabled={numberOfPeople <= 1}
                  className="h-14 w-14 rounded-2xl bg-muted/50 hover:bg-muted flex items-center justify-center text-foreground disabled:opacity-30 transition-all disabled:hover:scale-100 hover:scale-105"
                >
                  <Minus className="h-6 w-6" />
                </button>
                <div className="text-center min-w-[120px]">
                  <p className="font-display font-black text-5xl tracking-tight">{numberOfPeople}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">
                    {numberOfPeople === 1 ? "Person" : "People"}
                  </p>
                </div>
                <button
                  onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                  className="h-14 w-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 flex items-center justify-center transition-all hover:scale-105"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TICKET TIER SELECTION */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="font-display font-black text-2xl tracking-tight mb-6">Select Ticket Type</h3>
              
              <div className="space-y-4">
                {event.ticketTypes.map((ticket: any) => {
                  const price = getTicketPrice(ticket);
                  const maxQty = ticket.capacity - ticket.sold;
                  const isSoldOut = ticket.isSoldOut || maxQty <= 0;
                  const isSelected = selectedTicketType === ticket.name;

                  return (
                    <div 
                      key={ticket.name} 
                      className={cn(
                        "relative p-5 rounded-2xl transition-all duration-300 border-2 overflow-hidden group cursor-pointer",
                        isSoldOut ? "opacity-50 grayscale bg-muted/30 border-border/20 cursor-not-allowed" : 
                        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border/40 bg-card hover:border-primary/50 hover:shadow-lg"
                      )}
                      onClick={() => !isSoldOut && setSelectedTicketType(ticket.name)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                              isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                            )}>
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <span className="font-display font-black text-lg tracking-tight">{ticket.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[280px] block mt-2 ml-8">{ticket.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-display font-black text-2xl tracking-tight">{formatPrice(price)}</span>
                        </div>
                      </div>

                      {!isSoldOut && (
                        <div className="flex items-center justify-between mt-4 ml-8 pt-3 border-t border-border/30">
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest", isSelected ? "text-primary" : "text-muted-foreground")}>
                            {maxQty} remaining
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="font-display font-black text-2xl tracking-tight">Contact Details</h3>
              
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
                  <Input type="tel" placeholder="+1 234 567 890" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="h-14 rounded-2xl bg-muted/30 border-border/50 text-base px-4 focus-visible:ring-primary/50 focus-visible:border-primary transition-all" />
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

          {step === 0 && (
            <Button 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300"
              disabled={!canProceedFromSession()}
              onClick={() => setStep(1)}
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {step === 1 && (
            <Button 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300"
              onClick={() => setStep(2)}
            >
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {step === 2 && (
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Total</p>
                <p className="font-display font-black text-3xl leading-none tracking-tight">{formatPrice(calculateTotal())}</p>
              </div>
              <Button 
                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shrink-0 shadow-lg hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                disabled={!selectedTicketType}
                onClick={() => setStep(3)}
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 relative z-10">
              <div className="bg-card border-2 border-primary/20 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount to pay</span>
                <span className="font-display font-black text-2xl tracking-tight text-primary">{formatPrice(calculateTotal())}</span>
              </div>
              <Button 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                disabled={!guestEmail || !guestPhone || bookingMutation.isPending}
                onClick={handleCheckout}
              >
                {bookingMutation.isPending ? "Processing securely..." : "Pay Securely"}
              </Button>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
