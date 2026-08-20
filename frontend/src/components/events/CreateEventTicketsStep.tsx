import { useFormContext, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Trash2, Ticket, Tag, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventFormValues } from "@/lib/eventFormSchema";

const inputCls = "h-12 bg-background/50 border-border/50 rounded-xl font-medium text-sm";
const labelCls = "text-[10px] font-black uppercase tracking-widest text-muted-foreground";

export const CreateEventTicketsStep = () => {
  const form = useFormContext<EventFormValues>();
  const scheduleType = form.watch("scheduleType");

  const { fields: dayFields } = useFieldArray({ name: "days", control: form.control });
  const { fields: ticketFields, append: appendTicket, remove: removeTicket } = useFieldArray({ name: "ticketTypes", control: form.control });
  const { fields: voucherFields, append: appendVoucher, remove: removeVoucher } = useFieldArray({ name: "vouchers", control: form.control });

  return (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <Card className="border border-border/40 shadow-sm bg-card">
        <CardHeader className="pb-4 border-b border-border/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-3 font-black">
              <div className="p-2 bg-primary/10 rounded-xl"><Ticket className="h-4 w-4 text-primary" /></div>
              Tickets
            </CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => appendTicket({ name: "", description: "", price: 0, capacity: 100, isSoldOut: false, isFullPass: false })}
              className="rounded-xl h-10 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 text-primary">
              <Plus className="h-3 w-3" /> Add Tier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          {ticketFields.map((field, index) => (
            <div key={field.id} className="p-5 border border-border/40 rounded-xl bg-muted/10">
              <div className="flex justify-between items-center mb-5">
                <span className={cn(labelCls, "tracking-[0.3em]")}>Ticket Tier {index + 1}</span>
                {ticketFields.length > 1 && (
                  <button type="button" onClick={() => removeTicket(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-5">
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField control={form.control} name={`ticketTypes.${index}.name`} render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn(labelCls, "text-[9px]")}>Tier Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input className={cn(inputCls, "h-11")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`ticketTypes.${index}.price`} render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn(labelCls, "text-[9px]")}>Base Price (₹) <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input type="number" className={cn(inputCls, "h-11")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`ticketTypes.${index}.capacity`} render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn(labelCls, "text-[9px]")}>Total Capacity <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input type="number" className={cn(inputCls, "h-11")} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name={`ticketTypes.${index}.description`} render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(labelCls, "text-[9px]")}>Tier Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What does this tier include? e.g. Front-row seating, VIP lounge access, complimentary drinks…"
                        className="min-h-[70px] bg-background/50 border-border/50 rounded-xl font-medium text-sm resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Multi-day pricing */}
                {scheduleType === "multi_day" && dayFields.length > 0 && (
                  <div className="pt-4 border-t border-border/30 space-y-4">
                    <div className="flex flex-wrap items-center gap-6">
                      <FormField control={form.control} name={`ticketTypes.${index}.isFullPass`} render={({ field }) => (
                        <FormItem className="flex items-center gap-2.5 space-y-0">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-4 w-4 rounded border-primary/30" /></FormControl>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer text-primary">Enable Full Pass</FormLabel>
                        </FormItem>
                      )} />
                      {form.watch(`ticketTypes.${index}.isFullPass`) && (
                        <FormField control={form.control} name={`ticketTypes.${index}.fullPassPrice`} render={({ field }) => (
                          <FormItem className="flex-1 max-w-[180px]">
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-primary">₹</span>
                                <Input type="number" placeholder="Full Pass Price" className={cn(inputCls, "h-10 pl-7 bg-primary/10 border-primary/20 text-primary text-xs")} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                        <Label className={cn(labelCls, "text-[9px]")}>Daily Rates</Label>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {dayFields.map((day, dayIndex) => (
                          <div key={day.id} className="p-3 border border-border/30 rounded-xl space-y-2 hover:border-primary/20 transition-colors">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/70 block">
                              {day.date ? format(new Date(day.date as unknown as Date), "MMM dd") : `Day ${dayIndex + 1}`}
                            </span>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">₹</span>
                              <Input type="number" className={cn(inputCls, "h-9 pl-6 text-[11px]")} placeholder="Price"
                                onChange={(e) => {
                                  const prices = form.getValues(`ticketTypes.${index}.dayWisePrices`) || [];
                                  const i2 = prices.findIndex((p) => p.dayIndex === dayIndex);
                                  if (i2 > -1) prices[i2].price = Number(e.target.value);
                                  else prices.push({ dayIndex, price: Number(e.target.value) });
                                  form.setValue(`ticketTypes.${index}.dayWisePrices`, prices);
                                }}
                                value={form.watch(`ticketTypes.${index}.dayWisePrices`)?.find((p) => p.dayIndex === dayIndex)?.price || ""}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vouchers */}
      <Card className="border border-border/40 shadow-sm bg-card">
        <CardHeader className="pb-4 border-b border-border/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-3 font-black">
              <div className="p-2 bg-primary/10 rounded-xl"><Tag className="h-4 w-4 text-primary" /></div>
              Vouchers
            </CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => appendVoucher({ code: "", discountType: "percentage", discountAmount: 10, isActive: true })}
              className="rounded-xl h-10 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 text-primary">
              <Plus className="h-3 w-3" /> Add Voucher
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {voucherFields.map((field, index) => (
            <div key={field.id} className="grid md:grid-cols-4 gap-3 p-4 border border-border/30 rounded-xl bg-muted/10">
              <FormField control={form.control} name={`vouchers.${index}.code`} render={({ field }) => (
                <FormItem><FormControl><Input placeholder="CODE" className={cn(inputCls, "h-10 uppercase text-[11px] tracking-widest")} {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name={`vouchers.${index}.discountType`} render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className={cn(inputCls, "h-10 text-[10px]")}><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="percentage">% Off</SelectItem>
                      <SelectItem value="fixed">₹ Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name={`vouchers.${index}.discountAmount`} render={({ field }) => (
                <FormItem><FormControl><Input type="number" className={cn(inputCls, "h-10 text-[11px]")} {...field} /></FormControl></FormItem>
              )} />
              <Button type="button" variant="ghost" onClick={() => removeVoucher(index)} className="h-10 text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {voucherFields.length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-4">No vouchers yet. Add one to offer discounts.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
