export interface ITicketType {
  name: string;
  description?: string;
  price: number;
  capacity: number;
  sold: number;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location: {
    address: string;
    venueName?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  image?: string;
  category: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  ticketTypes: ITicketType[];
  status: 'draft' | 'published' | 'cancelled' | 'blocked';
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export type UserRole = 'user' | 'event_manager' | 'admin';

export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  token?: string;
}
