import { useFormContext, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Trash2, Ticket, Tag, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const EditEventInventoryStep = () => {
  const form = useFormContext<EventFormValues>();
  const scheduleType = form.watch("scheduleType");

  const { fields: dayFields } = useFieldArray({ name: "days", control: form.control });
  const { fields: ticketFields, append: appendTicket, remove: removeTicket } = useFieldArray({ name: "ticketTypes", control: form.control });
  const { fields: voucherFields, append: appendVoucher, remove: removeVoucher } = useFieldArray({ name: "vouchers", control: form.control });

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <Card className="border-none shadow-xl glass-card overflow-hidden">
        <CardHeader className="pb-4 bg-muted/20 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-3 font-black text-foreground">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Ticket className="h-4 w-4 text-primary" />
              </div>
              Tickets
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                appendTicket({
                  name: "",
                  price: 0,
                  capacity: 100,
                  isSoldOut: false,
                  isFullPass: false,
                })
              }
              className="rounded-xl h-10 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 text-primary"
            >
              <Plus className="h-3 w-3" /> Add Tier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {ticketFields.map((field, index) => (
            <div
              key={field.id}
              className="p-6 border border-white/5 rounded-2xl bg-background/20 relative group"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  Ticket Tier {index + 1}
                </span>
                {ticketFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicket(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name={`ticketTypes.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tier Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input className="h-12 bg-background/40 border-white/5 rounded-xl font-bold text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ticketTypes.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Base Cost (₹) <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" className="h-12 bg-background/40 border-white/5 rounded-xl font-black text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ticketTypes.${index}.capacity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Total Capacity <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" className="h-12 bg-background/40 border-white/5 rounded-xl font-black text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ticketTypes.${index}.isSoldOut`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v === "true")}
                          value={field.value ? "true" : "false"}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-background/40 border-white/5 rounded-xl font-bold text-xs">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card">
                            <SelectItem value="false" className="text-xs font-bold uppercase tracking-widest">Active</SelectItem>
                            <SelectItem value="true" className="text-xs font-bold uppercase tracking-widest text-destructive">Sold Out</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                {scheduleType === "multi_day" && (
                  <div className="space-y-6 pt-6 border-t border-white/5 mt-4">
                    <div className="flex flex-wrap items-center gap-8">
                      <FormField
                        control={form.control}
                        name={`ticketTypes.${index}.isFullPass`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="h-5 w-5 rounded-md border-primary/30"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer text-primary">
                                Enable Full Pass
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch(`ticketTypes.${index}.isFullPass`) && (
                        <FormField
                          control={form.control}
                          name={`ticketTypes.${index}.fullPassPrice`}
                          render={({ field }) => (
                            <FormItem className="flex-1 max-w-[200px] animate-in fade-in slide-in-from-left-2 duration-300">
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary">₹</span>
                                  <Input
                                    type="number"
                                    placeholder="Full Pass Cost"
                                    className="h-10 pl-7 bg-primary/10 border-primary/20 rounded-xl font-black text-xs text-primary shadow-inner"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Daily Rates Configuration</Label>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {dayFields.map((day, dayIndex) => (
                          <div key={day.id} className="p-4 bg-background/40 border border-white/5 rounded-2xl space-y-3 glass-card hover:border-primary/20 transition-colors">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-black uppercase tracking-widest text-primary/70">
                                {day.date ? format(new Date(day.date), "MMM dd") : `Day ${dayIndex + 1}`}
                              </span>
                              <p className="text-[9px] font-bold truncate">
                                {day.title || "Standard Entry"}
                              </p>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">₹</span>
                              <Input
                                type="number"
                                className="h-9 pl-6 bg-background/50 border-white/10 rounded-xl text-[10px] font-black shadow-inner"
                                placeholder="Price"
                                onChange={(e) => {
                                  const currentPrices = form.getValues(`ticketTypes.${index}.dayWisePrices`) || [];
                                  const existingIndex = currentPrices.findIndex(p => p.dayIndex === dayIndex);

                                  if (existingIndex > -1) {
                                    currentPrices[existingIndex].price = Number(e.target.value);
                                  } else {
                                    currentPrices.push({ dayIndex, price: Number(e.target.value) });
                                  }
                                  form.setValue(`ticketTypes.${index}.dayWisePrices`, currentPrices);
                                }}
                                value={form.watch(`ticketTypes.${index}.dayWisePrices`)?.find(p => p.dayIndex === dayIndex)?.price || ""}
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

      <Card className="border-none shadow-xl glass-card overflow-hidden">
        <CardHeader className="pb-3 bg-muted/20 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-3 font-black text-foreground">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Tag className="h-3.5 w-3.5 text-primary" />
              </div>
              Vouchers
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                appendVoucher({
                  code: "",
                  discountType: "percentage",
                  discountAmount: 10,
                  isActive: true,
                })
              }
              className="rounded-lg h-9 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 text-primary"
            >
              <Plus className="h-3 w-3" /> Add Voucher
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          {voucherFields.map((field, index) => (
            <div
              key={field.id}
              className="grid md:grid-cols-4 gap-4 p-4 border border-white/5 rounded-xl bg-background/10"
            >
              <FormField
                control={form.control}
                name={`vouchers.${index}.code`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="uppercase h-10 bg-background/40 border-white/5 rounded-lg font-black text-[10px] tracking-widest"
                        placeholder="CODE"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`vouchers.${index}.discountType`}
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 bg-background/40 border-white/5 rounded-lg font-black text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card">
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="fixed">
                          Fixed (₹)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`vouchers.${index}.discountAmount`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-10 bg-background/40 border-white/5 rounded-lg font-black text-[10px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeVoucher(index)}
                className="h-10 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};
