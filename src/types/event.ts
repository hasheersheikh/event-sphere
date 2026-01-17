export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  venue: string;
  image: string;
  category: string;
  price: number;
  currency: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  totalTickets: number;
  soldTickets: number;
  isFeatured?: boolean;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export type UserRole = 'user' | 'event_manager' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}
