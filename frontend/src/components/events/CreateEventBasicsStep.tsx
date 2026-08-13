import { useFormContext, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Info,
  Image as ImageIcon,
  Users,
  Video,
  Camera,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { UPLOAD_SPECS } from "@/lib/uploadSpecs";
import { EVENT_CATEGORIES, type EventFormValues } from "@/lib/eventFormSchema";
import { useEventMediaUpload } from "@/hooks/useEventMediaUpload";

const inputCls = "h-12 bg-background/50 border-border/50 rounded-xl font-medium text-sm";
const labelCls = "text-[10px] font-black uppercase tracking-widest text-muted-foreground";

export const CreateEventBasicsStep = () => {
  const form = useFormContext<EventFormValues>();
  const { fields: lineupFields, append: appendLineup, remove: removeLineup } = useFieldArray({ name: "lineup", control: form.control });

  const {
    bannerInputRef,
    videoInputRef,
    artistPhotoInputRef,
    artistPhotoUploading,
    handleUpload,
    handleLocalBannerUpload,
    handleArtistPhotoUpload,
    handleVideoUpload,
    handleVideoFileUpload,
  } = useEventMediaUpload();

  return (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <Card className="border border-border/40 shadow-sm bg-card">
        <CardHeader className="pb-4 border-b border-border/30">
          <CardTitle className="text-base flex items-center gap-3 font-black">
            <div className="p-2 bg-primary/10 rounded-xl"><Info className="h-4 w-4 text-primary" /></div>
            General Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelCls}>Event Title <span className="text-destructive">*</span></FormLabel>
              <FormControl><Input placeholder="e.g. Modern Web Summit 2025" className={cn(inputCls, "h-14 text-base font-bold")} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel className={labelCls}>Category <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(inputCls, "h-12")}><SelectValue placeholder="Select Category" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="space-y-2">
              <Label className={labelCls}>Event Banner <span className="text-destructive">*</span></Label>
              <input ref={bannerInputRef} type="file" accept={UPLOAD_SPECS.eventBanner.accept} className="hidden" onChange={handleLocalBannerUpload} />
              <button type="button" onClick={handleUpload} className={cn(
                "w-full h-12 bg-background/50 border border-dashed rounded-xl flex items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group",
                form.formState.errors.image ? "border-destructive/60" : "border-border/50"
              )}>
                <ImageIcon className={cn("h-4 w-4", form.formState.errors.image ? "text-destructive" : "text-muted-foreground group-hover:text-primary")} />
                <span className={cn("text-[10px] font-black uppercase tracking-widest", form.formState.errors.image ? "text-destructive" : "text-muted-foreground group-hover:text-primary")}>
                  {form.watch("image") ? "Change Image" : "Upload Image"}
                </span>
              </button>
              {form.formState.errors.image && (
                <p className="text-[11px] text-destructive font-medium">{form.formState.errors.image.message}</p>
              )}
              <p className="text-[10px] text-muted-foreground/60">
                Use your Instagram post photo (4:5 portrait, 1080 × 1350 px). This is the standard Instagram feed size, so no separate photo needed. {UPLOAD_SPECS.eventBanner.hint}
              </p>
            </div>
          </div>

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelCls}>Description <span className="text-destructive">*</span></FormLabel>
              <FormControl><Textarea placeholder="Describe the event..." className="min-h-[120px] bg-background/50 border-border/50 rounded-xl font-medium text-sm resize-none" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid md:grid-cols-2 gap-6">
             <FormField control={form.control} name="ageRestriction" render={({ field }) => (
               <FormItem>
                 <FormLabel className={labelCls}>Age Requirement</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                   <FormControl>
                     <SelectTrigger className={cn(inputCls, "h-12")}><SelectValue placeholder="Select Age" /></SelectTrigger>
                   </FormControl>
                   <SelectContent>
                     {["All Ages", "13+", "16+", "18+", "21+"].map((age) => (<SelectItem key={age} value={age} className="font-medium">{age}</SelectItem>))}
                   </SelectContent>
                 </Select>
                 <FormMessage />
               </FormItem>
             )} />

           {/* Artist Information */}
           <div className="md:col-span-2 space-y-4 pt-4 border-t border-border/30">
             <div className="flex items-center gap-2">
               <div className="p-1.5 bg-neon-lime/10 rounded-lg"><Users className="h-3.5 w-3.5 text-neon-lime" /></div>
               <Label className="text-[10px] font-black uppercase tracking-widest text-neon-lime">Artist Information (Optional)</Label>
             </div>
             <div className="grid md:grid-cols-3 gap-4">
               <FormField control={form.control} name="artist.name" render={({ field }) => (
                 <FormItem>
                   <FormLabel className={labelCls}>Artist Name</FormLabel>
                   <FormControl>
                     <Input placeholder="Artist name" className={cn(inputCls, "h-11")} {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )} />
               <FormField control={form.control} name="artist.instagramHandle" render={({ field }) => (
                 <FormItem>
                   <FormLabel className={labelCls}>Instagram Handle</FormLabel>
                   <FormControl>
                     <Input placeholder="@username" className={cn(inputCls, "h-11")} {...field} />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )} />
               <FormItem>
                 <FormLabel className={labelCls}>Artist Photo</FormLabel>
                 <div className="flex items-center gap-3">
                   <input
                     ref={artistPhotoInputRef}
                     type="file"
                     accept={UPLOAD_SPECS.artistPhoto.accept}
                     className="hidden"
                     onChange={handleArtistPhotoUpload}
                   />
                   <button
                     type="button"
                     onClick={() => artistPhotoInputRef.current?.click()}
                     disabled={artistPhotoUploading}
                     className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors flex items-center justify-center bg-background/50 group"
                   >
                     {form.watch("artist.profileImage") ? (
                       <>
                         <img src={form.watch("artist.profileImage")} alt="Artist" className="h-full w-full object-cover" />
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Camera className="h-3.5 w-3.5 text-white" />
                         </div>
                       </>
                     ) : artistPhotoUploading ? (
                       <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                     ) : (
                       <Camera className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                     )}
                   </button>
                   <span className="text-[10px] text-muted-foreground/60 leading-snug">{UPLOAD_SPECS.artistPhoto.hint}</span>
                 </div>
               </FormItem>
              </div>
            </div>

            {/* Lineup */}
            <div className="md:col-span-2 space-y-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg"><Users className="h-3.5 w-3.5 text-primary" /></div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Event Lineup (Influencers & Hosts)</Label>
              </div>
              <div className="space-y-3">
                {lineupFields.map((_, index) => (
                  <div key={index} className="p-4 border border-border/40 rounded-xl bg-muted/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={labelCls}>Person {index + 1}</span>
                      <button type="button" onClick={() => removeLineup(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <FormField control={form.control} name={`lineup.${index}.name`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className={cn(labelCls, "text-[9px]")}>Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Shah Rukh Khan" className={cn(inputCls, "h-10 text-xs")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`lineup.${index}.role`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className={cn(labelCls, "text-[9px]")}>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Host, DJ, Guest" className={cn(inputCls, "h-10 text-xs")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`lineup.${index}.instagramUrl`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className={cn(labelCls, "text-[9px]")}>Instagram Profile URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/username" className={cn(inputCls, "h-10 text-xs")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`lineup.${index}.image`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className={cn(labelCls, "text-[9px]")}>Profile Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="Profile image URL" className={cn(inputCls, "h-10 text-xs")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendLineup({ name: "", role: "", instagramUrl: "", image: "" })} className="w-full h-10 rounded-xl border-dashed border-border/50 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5">
                  <Plus className="h-3 w-3" /> Add Person to Lineup
                </Button>
              </div>
            </div>

             <FormField control={form.control} name="videoUrl" render={({ field }) => (
              <FormItem>
                <FormLabel className={labelCls}>Main Video URL (YouTube)</FormLabel>
                <FormControl><Input placeholder="https://youtube.com/watch?v=..." className={inputCls} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Event Video Upload - for banner gallery */}
            <div className="space-y-2">
              <Label className={labelCls}>Event Video <span className="text-muted-foreground">(Optional)</span></Label>
              <input
                ref={videoInputRef}
                type="file"
                accept={UPLOAD_SPECS.eventVideo.accept}
                className="hidden"
                onChange={handleVideoFileUpload}
              />
              <button
                type="button"
                onClick={handleVideoUpload}
                className="w-full h-12 bg-background/50 border border-dashed border-primary/30 rounded-xl flex items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group"
              >
                <Video className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-primary/80">
                  {form.watch("eventVideo") ? "Change Video" : "Upload Event Video"}
                </span>
              </button>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground/60">
                  {UPLOAD_SPECS.eventVideo.hint}. Video will be displayed in a gallery with your banner image (5s image → video loop).
                </p>
                <p className="text-[9px] text-orange-500/70 font-medium">
                  ⚠️ Use Instagram photo aspect ratio (4:5 portrait, 1080 × 1350 px). Videos in other aspect ratios will be cropped.
                </p>
              </div>
              {form.watch("eventVideo") && (
                <div className="relative aspect-[4/5] w-32 rounded-lg overflow-hidden bg-muted border border-border/30 mt-2">
                  <video src={form.watch("eventVideo")} className="w-full h-full object-cover" muted />
                  <button
                    type="button"
                    onClick={() => form.setValue("eventVideo", "")}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/90 text-white flex items-center justify-center hover:bg-destructive transition-colors"
                    title="Remove video"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className={labelCls}>Event Reels & Shorts</Label>
              <div className="space-y-2">
                {form.watch("reels")?.map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Input className={cn(inputCls, "h-10 text-xs")} placeholder="YouTube Short or Instagram Reel URL"
                      value={form.watch(`reels.${index}`)}
                      onChange={(e) => { const r = [...(form.getValues("reels") || [])]; r[index] = e.target.value; form.setValue("reels", r); }}
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => { const r = [...(form.getValues("reels") || [])]; r.splice(index, 1); form.setValue("reels", r); }} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => form.setValue("reels", [...(form.getValues("reels") || []), ""])} className="w-full h-10 rounded-xl border-dashed border-border/50 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5">
                  <Plus className="h-3 w-3" /> Add Reel/Short
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
