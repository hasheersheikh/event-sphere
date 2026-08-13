import { useFormContext, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { format, isSameDay } from "date-fns";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  AlertCircle,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CityCombobox } from "@/components/events/CityCombobox";
import { SCHEDULE_TYPES, WEEK_DAYS, hasSlotOverlap, type EventFormValues } from "@/lib/eventFormSchema";

const inputCls = "h-12 bg-background/50 border-border/50 rounded-xl font-medium text-sm";
const labelCls = "text-[10px] font-black uppercase tracking-widest text-muted-foreground";

export const CreateEventScheduleStep = () => {
  const form = useFormContext<EventFormValues>();
  const scheduleType = form.watch("scheduleType");
  const recurrenceFreq = form.watch("recurrence.frequency");
  const recurrenceDays = form.watch("recurrence.daysOfWeek") || [];

  const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({ name: "slots", control: form.control });
  const { fields: dayFields, remove: removeDay } = useFieldArray({ name: "days", control: form.control });

  // ── Schedule type change — clears stale type-specific data ───────────────
  const handleScheduleTypeChange = (newType: EventFormValues["scheduleType"]) => {
    if (newType === scheduleType) return;
    // Clear multi_day-specific ticket data when leaving multi_day
    if (scheduleType === "multi_day" && newType !== "multi_day") {
      const tickets = form.getValues("ticketTypes");
      tickets.forEach((_, i) => {
        form.setValue(`ticketTypes.${i}.isFullPass`, false);
        form.setValue(`ticketTypes.${i}.dayWisePrices`, []);
      });
    }
    form.setValue("scheduleType", newType);
    form.setValue("slots", []);
    form.setValue("days", []);
    form.setValue("recurrence", { frequency: "daily", daysOfWeek: [] });
    // Clear date/time when switching to multi_day — derived from days array instead
    if (newType === "multi_day") {
      form.setValue("date", undefined);
      form.setValue("time", "");
      form.setValue("endTime", "");
    }
  };

  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <Card className="border border-border/40 shadow-sm bg-card">
        <CardHeader className="pb-4 border-b border-border/30">
          <CardTitle className="text-base flex items-center gap-3 font-black">
            <div className="p-2 bg-primary/10 rounded-xl"><CalendarIcon className="h-4 w-4 text-primary" /></div>
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">

          {/* ── Schedule type selector ─────────────────────── */}
          <div>
            <p className={cn(labelCls, "mb-3")}>Event Type</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SCHEDULE_TYPES.map((opt) => {
                const Icon = opt.icon;
                const active = scheduleType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleScheduleTypeChange(opt.type)}
                    className={cn(
                      "p-4 border-2 rounded-xl text-left transition-all duration-200",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/20 border-border/40 hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mb-2.5", active ? "text-primary-foreground" : "text-muted-foreground")} />
                    <p className="text-[11px] font-black uppercase tracking-wider">{opt.label}</p>
                    <p className={cn("text-[10px] mt-0.5 leading-snug", active ? "text-primary-foreground/70" : "text-muted-foreground")}>{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Single Event ───────────────────────────────── */}
          {scheduleType === "single" && (
            <div className="grid md:grid-cols-3 gap-5">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className={labelCls}>Date <span className="text-destructive">*</span></FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button type="button" variant="outline" className={cn(inputCls, "text-left px-4", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : "Select Date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Start Time <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input type="time" className={inputCls} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endTime" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>End Time</FormLabel>
                  <FormControl><Input type="time" className={inputCls} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          )}

          {/* ── Multi-Slot ─────────────────────────────────── */}
          {scheduleType === "multi_slot" && (
            <div className="space-y-5">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col max-w-xs">
                  <FormLabel className={labelCls}>Event Date <span className="text-destructive">*</span></FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button type="button" variant="outline" className={cn(inputCls, "text-left px-4 w-full", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : "Select Date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />

              {hasSlotOverlap(form.watch("slots") || []) && (
                <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-600 text-xs font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Some time slots overlap. Please check the times.
                </div>
              )}

              <div className="space-y-3">
                {slotFields.map((slot, index) => (
                  <div key={slot.id} className="p-4 border border-border/40 rounded-xl bg-muted/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn(labelCls)}>Show {index + 1}</span>
                      <button type="button" onClick={() => removeSlot(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <FormField control={form.control} name={`slots.${index}.startTime`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className={cn(labelCls, "text-[9px]")}>Start Time</FormLabel>
                          <FormControl><Input type="time" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`slots.${index}.endTime`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className={cn(labelCls, "text-[9px]")}>End Time</FormLabel>
                          <FormControl><Input type="time" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`slots.${index}.label`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className={cn(labelCls, "text-[9px]")}>Label</FormLabel>
                          <FormControl><Input placeholder="e.g. Evening Show" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`slots.${index}.capacity`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className={cn(labelCls, "text-[9px]")}>Capacity</FormLabel>
                          <FormControl><Input type="number" placeholder="e.g. 100" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendSlot({ startTime: "09:00", endTime: "11:00", label: "", capacity: undefined })}
                  className="w-full h-11 rounded-xl border-dashed border-border/50 text-[10px] font-black uppercase gap-2 hover:bg-primary/5 hover:border-primary/50">
                  <Plus className="h-3.5 w-3.5" /> Add Show Slot
                </Button>
              </div>
            </div>
          )}

          {/* ── Recurring ──────────────────────────────────── */}
          {scheduleType === "recurring" && (
            <div className="space-y-5">
              <div className="grid md:grid-cols-3 gap-5">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className={labelCls}>Start Date <span className="text-destructive">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button type="button" variant="outline" className={cn(inputCls, "text-left px-4", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : "Select Date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="time" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls}>Time <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="time" className={inputCls} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelCls}>End Time</FormLabel>
                    <FormControl><Input type="time" className={inputCls} {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

              {/* Frequency */}
              <div className="p-5 border border-border/40 rounded-xl bg-muted/10 space-y-4">
                <p className={labelCls}>Repeat Frequency</p>
                <div className="flex gap-3">
                  {(["daily", "weekly"] as const).map((freq) => (
                    <button key={freq} type="button"
                      onClick={() => {
                        form.setValue("recurrence.frequency", freq);
                        if (freq === "daily") form.setValue("recurrence.daysOfWeek", []);
                      }}
                      className={cn("flex-1 h-11 rounded-xl border-2 text-[11px] font-black uppercase tracking-wider transition-all",
                        recurrenceFreq === freq ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40"
                      )}>
                      {freq === "daily" ? "Daily" : "Weekly"}
                    </button>
                  ))}
                </div>

                {recurrenceFreq === "weekly" && (
                  <div>
                    <p className={cn(labelCls, "mb-3")}>Repeat On</p>
                    <div className="flex flex-wrap gap-2">
                      {WEEK_DAYS.map((day) => {
                        const selected = recurrenceDays.includes(day.value);
                        return (
                          <button key={day.value} type="button"
                            onClick={() => {
                              const current = form.getValues("recurrence.daysOfWeek") || [];
                              form.setValue("recurrence.daysOfWeek",
                                selected ? current.filter((d) => d !== day.value) : [...current, day.value]
                              );
                            }}
                            className={cn("h-9 w-12 rounded-lg border-2 text-[10px] font-black uppercase transition-all",
                              selected ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40"
                            )}>
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Optional end date */}
                <FormField control={form.control} name="recurrence.endDate" render={({ field }) => (
                  <FormItem className="flex flex-col max-w-xs">
                    <FormLabel className={labelCls}>End Date (optional: leave blank for no end)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button type="button" variant="outline" className={cn(inputCls, "h-10 text-left px-4 text-sm", !field.value && "text-muted-foreground")}>
                            {field.value ? format(new Date(field.value), "PPP") : "No end date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(d) => field.onChange(d || null)}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                      </PopoverContent>
                    </Popover>
                    {field.value && (
                      <button type="button" onClick={() => field.onChange(null)} className="text-[10px] font-bold text-muted-foreground hover:text-destructive w-fit mt-1 transition-colors">
                        Clear end date
                      </button>
                    )}
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4 pt-4 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(labelCls, "text-[11px] text-foreground")}>Time Slots (Optional)</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Add specific shows for each day of this recurrence.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendSlot({ startTime: "10:00", endTime: "12:00", label: "", capacity: undefined })}
                    className="h-9 rounded-xl border-dashed border-primary/30 text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-primary/5">
                    <Plus className="h-3 w-3" /> Add Slot
                  </Button>
                </div>

                {slotFields.length > 0 && (
                  <div className="space-y-3">
                    {slotFields.map((slot, index) => (
                      <div key={slot.id} className="p-4 border border-border/40 rounded-xl bg-muted/10 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                          <span className={cn(labelCls)}>Show {index + 1}</span>
                          <button type="button" onClick={() => removeSlot(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <FormField control={form.control} name={`slots.${index}.startTime`} render={({ field }) => (
                            <FormItem>
                              <FormLabel className={cn(labelCls, "text-[9px]")}>Start</FormLabel>
                              <FormControl><Input type="time" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`slots.${index}.endTime`} render={({ field }) => (
                            <FormItem>
                              <FormLabel className={cn(labelCls, "text-[9px]")}>End</FormLabel>
                              <FormControl><Input type="time" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`slots.${index}.label`} render={({ field }) => (
                            <FormItem>
                              <FormLabel className={cn(labelCls, "text-[9px]")}>Label</FormLabel>
                              <FormControl><Input placeholder="e.g. Afternoon" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`slots.${index}.capacity`} render={({ field }) => (
                            <FormItem>
                              <FormLabel className={cn(labelCls, "text-[9px]")}>Capacity</FormLabel>
                              <FormControl><Input type="number" placeholder="100" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                            </FormItem>
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Multi-Day ──────────────────────────────────── */}
          {scheduleType === "multi_day" && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground font-medium">
                Pick any combination of dates. They don't need to be continuous.
              </p>

              {/* Multi-select calendar */}
              <div className="flex justify-center">
                <div className="border border-border/40 rounded-2xl overflow-hidden p-1 bg-muted/10">
                  <Calendar
                    mode="multiple"
                    selected={dayFields.map((f) => f.date as unknown as Date).filter(Boolean)}
                    onSelect={(dates: Date[] | undefined) => {
                      const existing = form.getValues("days") || [];
                      const newDates = dates || [];
                      // Build merged array: keep existing entries that are still selected, add new
                      const merged = newDates.map((d) => {
                        const found = existing.find((e) => e.date && isSameDay(new Date(e.date), d));
                        return found || { date: d, startTime: "09:00", endTime: "17:00", title: "" };
                      });
                      form.setValue("days", merged);
                    }}
                    disabled={(d) => {
                      const alreadySelected = dayFields.some(f => f.date && isSameDay(new Date(f.date as unknown as Date), d));
                      return !alreadySelected && d < new Date(new Date().setHours(0, 0, 0, 0));
                    }}
                    numberOfMonths={2}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {dayFields.length > 0 && (
                <div className="space-y-3">
                  <p className={labelCls}>{dayFields.length} date{dayFields.length > 1 ? "s" : ""} selected. Set times for each</p>
                  {dayFields
                    .map((f, i) => ({ ...f, originalIndex: i }))
                    .sort((a, b) => new Date(a.date as unknown as Date).getTime() - new Date(b.date as unknown as Date).getTime())
                    .map((field) => {
                      const index = field.originalIndex;
                      return (
                      <div key={field.id} className="p-4 border border-border/40 rounded-xl bg-muted/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-black tracking-tight">
                            {field.date ? format(new Date(field.date as unknown as Date), "EEE, MMM d yyyy") : `Day ${index + 1}`}
                          </span>
                          <button type="button" onClick={() => removeDay(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <FormField control={form.control} name={`days.${index}.title`} render={({ field }) => (
                            <FormItem>
                              <FormLabel className={cn(labelCls, "text-[9px]")}>Label (optional)</FormLabel>
                              <FormControl><Input placeholder="e.g. Workshop Day" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`days.${index}.startTime`} render={({ field }) => (
                            <FormItem>
                              <FormLabel className={cn(labelCls, "text-[9px]")}>Start</FormLabel>
                              <FormControl><Input type="time" className={cn(inputCls, "h-10")} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`days.${index}.endTime`} render={({ field }) => (
                            <FormItem>
                              <FormLabel className={cn(labelCls, "text-[9px]")}>End</FormLabel>
                              <FormControl><Input type="time" className={cn(inputCls, "h-10")} {...field} /></FormControl>
                            </FormItem>
                          )} />
                        </div>
                      </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="border border-border/40 shadow-sm bg-card">
        <CardHeader className="pb-4 border-b border-border/30">
          <CardTitle className="text-base flex items-center gap-3 font-black">
            <div className="p-2 bg-primary/10 rounded-xl"><MapPin className="h-4 w-4 text-primary" /></div>
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className={labelCls}>City <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <CityCombobox
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select city"
                  triggerClassName={inputCls}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid md:grid-cols-2 gap-5">
            <FormField control={form.control} name="location.venueName" render={({ field }) => (
              <FormItem>
                <FormLabel className={labelCls}>Venue Name</FormLabel>
                <FormControl><Input placeholder="e.g. Grand Plaza" className={inputCls} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="location.address" render={({ field }) => (
              <FormItem>
                <FormLabel className={labelCls}>Address <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Full Address" className={inputCls} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="location.googleMapUrl" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelCls}>Google Maps Link (optional)</FormLabel>
              <FormControl><Input placeholder="https://maps.app.goo.gl/..." className={inputCls} {...field} /></FormControl>
              <FormDescription className="text-[10px] text-muted-foreground">Paste a Google Maps share link to show the exact pin on the event page.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </CardContent>
      </Card>

      <Card className="border border-border/40 shadow-sm bg-card">
        <CardHeader className="pb-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-3 font-black">
              <div className="p-2 bg-primary/10 rounded-xl"><MapPin className="h-4 w-4 text-primary" /></div>
              Offline Tickets
            </CardTitle>
            <FormField control={form.control} name="offlineTicketsAvailable" render={({ field }) => (
              <FormItem className="flex items-center gap-3 space-y-0">
                <FormLabel className={cn(labelCls, "text-[9px]")}>Available</FormLabel>
                <FormControl>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!field.value}
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none",
                      field.value ? "bg-neon-lime" : "bg-muted"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform",
                      field.value ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </FormControl>
              </FormItem>
            )} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 ml-11">
            When enabled, attendees will see a "Call Coordinator" option on the event page to purchase tickets offline.
          </p>
        </CardHeader>
        {form.watch("offlineTicketsAvailable") && (
          <CardContent className="pt-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <FormField control={form.control} name="coordinator.name" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Coordinator Name</FormLabel>
                  <FormControl><Input placeholder="e.g. John Doe" className={inputCls} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="coordinator.phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelCls}>Contact Number <span className="text-destructive">*</span></FormLabel>
                  <div className="flex gap-2 items-center">
                    <div className="h-12 px-4 flex items-center justify-center rounded-xl bg-background/50 border border-border/50 text-sm font-black text-foreground shrink-0 select-none">
                      +91
                    </div>
                    <FormControl>
                      <Input
                        placeholder="9876543210"
                        className={cn(inputCls, "flex-1")}
                        value={field.value ? field.value.replace(/^\+91/, "") : ""}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                          field.onChange(digits ? "+91" + digits : "");
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormDescription className="text-[10px] text-muted-foreground">Enter the 10-digit phone number (e.g., 9876543210)</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};
