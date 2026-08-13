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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export const EditEventBasicsStep = () => {
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
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <Card className="border-none shadow-xl glass-card overflow-hidden">
        <CardHeader className="pb-3 bg-muted/20 border-b">
          <CardTitle className="text-base flex items-center gap-3 font-black text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Info className="h-3.5 w-3.5 text-primary" />
            </div>
            General Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Event Title <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm focus:ring-primary shadow-inner"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Category <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 bg-background/50 border-white/10 rounded-xl font-black">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border shadow-2xl">
                      {EVENT_CATEGORIES.map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="font-bold"
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 block">
                    Event Banner <span className="text-destructive">*</span>
                  </FormLabel>
                  <input ref={bannerInputRef} type="file" accept={UPLOAD_SPECS.eventBanner.accept} className="hidden" onChange={handleLocalBannerUpload} />
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="w-full h-11 bg-background/50 border border-dashed border-white/20 rounded-lg flex items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                  >
                    <ImageIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                      {form.watch("image")
                        ? "Change Image"
                        : "Upload Image"}
                    </span>
                  </button>
                  <p className="text-[9px] text-muted-foreground/60 ml-1">{UPLOAD_SPECS.eventBanner.hint}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Description <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[100px] bg-background/50 border-white/10 rounded-lg font-bold text-xs resize-none shadow-inner"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="ageRestriction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Age Requirement
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-background/50 border-white/10 rounded-xl font-black">
                        <SelectValue placeholder="Select Age" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border shadow-2xl">
                      {["All Ages", "13+", "16+", "18+", "21+"].map((age) => (
                        <SelectItem key={age} value={age} className="font-bold">{age}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    YouTube Video URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm shadow-inner"
                      placeholder="Link URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Video Upload - for banner gallery */}
            <div className="space-y-2">
              <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 block">
                Event Video <span className="text-muted-foreground/70">(Optional)</span>
              </FormLabel>
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
                className="w-full h-11 bg-background/50 border border-dashed border-white/20 rounded-lg flex items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group"
              >
                <Video className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary group-hover:text-primary/80">
                  {form.watch("eventVideo") ? "Change Video" : "Upload Event Video"}
                </span>
              </button>
              <div className="space-y-1">
                <p className="text-[9px] text-muted-foreground/60">
                  {UPLOAD_SPECS.eventVideo.hint}. Video will be displayed in a gallery with your banner image.
                </p>
                <p className="text-[8px] text-orange-500/70 font-medium">
                  ⚠️ Use Instagram photo aspect ratio (4:5 portrait). Other ratios will be cropped.
                </p>
              </div>
              {form.watch("eventVideo") && (
                <div className="relative aspect-[4/5] w-28 rounded-lg overflow-hidden bg-muted border border-white/10 mt-2">
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
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-primary/10 rounded-lg"><Users className="h-3.5 w-3.5 text-primary" /></div>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary block">Artist Information (Optional)</FormLabel>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <FormField control={form.control} name="artist.name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Artist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Artist name" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold px-2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="artist.instagramHandle" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Instagram Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@username" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold px-2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormItem>
                <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Artist Photo</FormLabel>
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
                    className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border-2 border-dashed border-white/10 hover:border-primary/50 transition-colors flex items-center justify-center bg-background/50 group"
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
                  <span className="text-[9px] text-muted-foreground/60 leading-snug">{UPLOAD_SPECS.artistPhoto.hint}</span>
                </div>
              </FormItem>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-primary/10 rounded-lg"><Users className="h-3.5 w-3.5 text-primary" /></div>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary block">Event Lineup (Influencers & Hosts)</FormLabel>
            </div>
            <div className="space-y-3">
              {lineupFields.map((_, index) => (
                <div key={index} className="p-4 border border-white/5 rounded-xl bg-muted/10 space-y-3 glass-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Person {index + 1}</span>
                    <button type="button" onClick={() => removeLineup(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <FormField control={form.control} name={`lineup.${index}.name`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Shah Rukh Khan" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold px-2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`lineup.${index}.role`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Role</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Host, DJ, Guest" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`lineup.${index}.instagramUrl`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Instagram Profile URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/username" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold px-2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name={`lineup.${index}.image`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Profile Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Profile image URL" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold px-2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendLineup({ name: "", role: "", instagramUrl: "", image: "" })} className="w-full h-11 rounded-xl border-dashed border-white/20 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5 hover:border-primary">
                <Plus className="h-3 w-3" /> Add Person to Lineup
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 block">
              YouTube Shorts
            </FormLabel>
            <div className="space-y-3">
              {form.watch("reels")?.map((_, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    className="h-12 bg-background/40 border-white/5 rounded-xl font-black shadow-inner text-xs"
                    placeholder="https://youtube.com/shorts/..."
                    value={form.watch(`reels.${index}`)}
                    onChange={(e) => {
                      const newReels = [
                        ...(form.getValues("reels") || []),
                      ];
                      newReels[index] = e.target.value;
                      form.setValue("reels", newReels);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const newReels = [
                        ...(form.getValues("reels") || []),
                      ];
                      newReels.splice(index, 1);
                      form.setValue("reels", newReels);
                    }}
                    className="hover:bg-destructive/10 hover:text-destructive h-12 w-12 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  form.setValue("reels", [
                    ...(form.getValues("reels") || []),
                    "",
                  ])
                }
                className="w-full h-12 rounded-xl border-dashed border-white/20 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5 hover:border-primary/50"
              >
                <Plus className="h-3 w-3" /> Add YouTube Short
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
