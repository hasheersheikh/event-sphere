import { mockEvents, categories } from "@/data/mockEvents";
import concertImage from "@/assets/events/concert-event.jpg";
import techConferenceImage from "@/assets/events/tech-conference.jpg";
import foodWineImage from "@/assets/events/food-wine-festival.jpg";
import yogaRetreatImage from "@/assets/events/yoga-retreat.jpg";

// Map images to events
export const eventsWithImages = mockEvents.map((event, index) => {
  const images = [techConferenceImage, concertImage, techConferenceImage, yogaRetreatImage, foodWineImage, techConferenceImage];
  return {
    ...event,
    image: images[index] || techConferenceImage,
  };
});

export { categories };
