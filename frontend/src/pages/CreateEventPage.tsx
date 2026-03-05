import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  Ticket,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  endTime: z.string().optional(),
  location: z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
    venueName: z.string().optional(),
  }),
  image: z.string().url("Please enter a valid image URL").or(z.literal("")),
  ticketTypes: z
    .array(
      z.object({
        name: z.string().min(1, "Ticket name is required"),
        description: z.string().optional(),
        price: z.coerce.number().min(0, "Price cannot be negative"),
        capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
      }),
    )
    .min(1, "At least one ticket type is required"),
});

type EventFormValues = z.infer<typeof eventSchema>;

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: "",
      time: "",
      location: {
        address: "",
        venueName: "",
      },
      image: "",
      ticketTypes: [{ name: "General Admission", price: 0, capacity: 100 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "ticketTypes",
    control: form.control,
  });

  const mutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const { data } = await api.post("/events", values);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Event created successfully!");
      navigate(`/events/${data._id}/success`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    },
  });

  const onSubmit = (values: EventFormValues) => {
    mutation.mutate(values);
  };

  const categories = [
    "Music",
    "Technology",
    "Business",
    "Entertainment",
    "Health",
    "Sports",
    "Education",
    "Other",
  ];

  const handleUpload = () => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "demo", // TODO: Replace with your Cloudinary cloud name
        uploadPreset: "unsigned_preset", // TODO: Replace with your unsinged upload preset
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1.6, // Aspect ratio for event banner
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          console.log("Done! Here is the image info: ", result.info);
          form.setValue("image", result.info.secure_url);
          toast.success("Image uploaded successfully!");
        }
        if (error) {
          toast.error("Upload failed. Please try again.");
        }
      },
    );
    widget.open();
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container max-w-4xl py-12 px-4 md:px-6">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Create New Event
          </h1>
          <p className="text-muted-foreground text-lg">
            Bring people together with your amazing event
          </p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Information */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  General Information
                </CardTitle>
                <CardDescription>
                  Tell us the basic details about your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Modern Web Development Summit 2024"
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
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Image</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {field.value ? (
                              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted group">
                                <img
                                  src={field.value}
                                  alt="Preview"
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleUpload}
                                  >
                                    Change Image
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleUpload}
                                className="w-full aspect-[16/10] rounded-xl border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary group"
                              >
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10">
                                  <ImageIcon className="h-5 w-5" />
                                </div>
                                <span className="font-medium">
                                  Upload Event Banner
                                </span>
                                <span className="text-xs">
                                  Recommended size: 1200 x 750 (1.6:1)
                                </span>
                              </button>
                            )}
                            <Input type="hidden" {...field} />
                          </div>
                        </FormControl>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What is this event about? What can attendees expect?"
                          className="min-h-[150px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Date and Time */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Date & Time
                </CardTitle>
                <CardDescription>When is your event happening?</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6 pt-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (Optional)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
                <CardDescription>Where should people go?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <FormField
                  control={form.control}
                  name="location.venueName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Grand Convention Center"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Event St, City, State"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Tickets */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-primary" />
                      Ticket Options
                    </CardTitle>
                    <CardDescription>
                      Create different ticket tiers for your event
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ name: "", price: 0, capacity: 100 })
                    }
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Tier
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-xl bg-muted/20 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-primary">
                        Ticket Tier #{index + 1}
                      </h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`ticketTypes.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Ticket Name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Early Bird" {...field} />
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
                            <FormLabel className="text-xs">Price (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
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
                            <FormLabel className="text-xs">Capacity</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`ticketTypes.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Description (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="What's included in this ticket?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-4 border-t sticky bottom-6 bg-muted/30 backdrop-blur-sm p-4 rounded-2xl z-20">
              <Button
                type="submit"
                size="lg"
                className="flex-1 shadow-button"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating Event..." : "Publish Event"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/")}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </main>

      <Footer />
    </div>
  );
};

export default CreateEventPage;
