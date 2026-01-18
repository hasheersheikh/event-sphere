import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Ticket, Calendar, MapPin, User as UserIcon, Plus, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings');
      return data;
    }
  });

  const { data: myEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['my-events'],
    queryFn: async () => {
      const { data } = await api.get('/events/my');
      return data;
    },
    enabled: user?.role === 'event_manager' || user?.role === 'admin'
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success("Event deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete event");
    },
    onSettled: () => {
      setIsDeleting(null);
    }
  });

  const handleDelete = (id: string) => {
    setIsDeleting(id);
    deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground text-lg">Manage your bookings and events</p>
          </div>
          {(user?.role === 'event_manager' || user?.role === 'admin') && (
            <Link to="/events/create">
              <Button className="gap-2 shadow-button">
                <Plus className="h-4 w-4" />
                Create New Event
              </Button>
            </Link>
          )}
        </header>

        <div className="grid gap-8">
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              My Bookings
            </h2>

            {bookingsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading your bookings...</div>
            ) : bookings?.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking: any) => (
                  <Link key={booking._id} to={`/events/${booking.event._id}`}>
                    <div className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border">
                      <h3 className="font-bold text-lg mb-3 line-clamp-1">{booking.event.title}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{new Date(booking.event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate">{booking.event.location.address}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t flex justify-between items-center">
                        <Badge variant="secondary">{booking.tickets[0].quantity}x {booking.tickets[0].type}</Badge>
                        <span className="text-sm font-bold text-primary">₹{booking.totalAmount}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-2xl border-2 border-dashed p-12 text-center">
                <Ticket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">You haven't booked any events yet. Start exploring now!</p>
                <Link to="/events">
                  <Badge className="px-6 py-2 cursor-pointer">Browse Events</Badge>
                </Link>
              </div>
            )}
          </section>

          {(user?.role === 'event_manager' || user?.role === 'admin') && (
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                My Created Events
              </h2>
              
              {eventsLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading your events...</div>
              ) : myEvents?.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {myEvents.map((event: any) => (
                    <div key={event._id} className="bg-card rounded-xl shadow-sm border overflow-hidden flex flex-col group">
                      {event.image && (
                        <div className="h-32 overflow-hidden bg-muted">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <h3 className="font-bold text-base line-clamp-1">{event.title}</h3>
                          <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="capitalize shrink-0">
                            {event.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1.5 mb-4 text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{event.location.venueName || event.location.address}</span>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t flex gap-2">
                          <Link to={`/events/${event._id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full gap-2">
                              <ExternalLink className="h-3.5 w-3.5" />
                              View
                            </Button>
                          </Link>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete <strong>{event.title}</strong> and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(event._id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {isDeleting === event._id ? "Deleting..." : "Delete Event"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10 text-center">
                  <p className="text-muted-foreground mb-6">You haven't created any events yet.</p>
                  <Link to="/events/create">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Event
                    </Button>
                  </Link>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
