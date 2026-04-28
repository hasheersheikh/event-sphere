import { mockEvents, categories } from "@/data/mockEvents";
import concertImage from "@/assets/events/concert-event.jpg";
import techConferenceImage from "@/assets/events/tech-conference.jpg";
import foodWineImage from "@/assets/events/food-wine-festival.jpg";
import yogaRetreatImage from "@/assets/events/yoga-retreat.jpg";

const categoryImageMap: Record<string, string> = {
  "Music": concertImage,
  "Comedy": concertImage,
  "Sports": concertImage,
  "Arts": concertImage,
  "Meetups": techConferenceImage,
  "Technology": techConferenceImage,
  "Business": techConferenceImage,
  "Workshops": techConferenceImage,
  "Food & Drink": foodWineImage,
  "Health": yogaRetreatImage,
};

export const eventsWithImages = mockEvents.map((event) => ({
  ...event,
  image: event.image || categoryImageMap[event.category] || techConferenceImage,
}));

export { categories };
