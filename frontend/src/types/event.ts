export interface ITicketType {
  name: string;
  description?: string;
  price: number;
  dayWisePrices?: { dayIndex: number; price: number }[];
  isFullPass?: boolean;
  fullPassPrice?: number;
  capacity: number;
  sold: number;
  isSoldOut?: boolean;
}

export interface IEventDay {
  date: string;
  startTime: string;
  endTime?: string;
  title?: string;
}

export interface ISlot {
  startTime: string;
  endTime?: string;
  label?: string;
  capacity?: number;
  sold?: number;
  isSoldOut?: boolean;
}

export interface IRecurrence {
  frequency: 'daily' | 'weekly';
  daysOfWeek?: number[];
  endDate?: string;
  dates?: string[];
  isActive: boolean;
  exceptions?: string[];
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  scheduleType: 'single' | 'multi_slot' | 'recurring' | 'multi_day';
  date: string;
  time: string;
  endTime?: string;
  slots?: ISlot[];
  recurrence?: IRecurrence;
  days?: IEventDay[];
  isMultiDay?: boolean;
  city?: string;
  location: {
    address: string;
    venueName?: string;
    googleMapUrl?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  image?: string;
  category: string;
  videoUrl?: string;
  reels?: string[];
  ageRestriction?: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  ticketTypes: ITicketType[];
  vouchers?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountAmount: number;
    isActive: boolean;
  }[];
  status: 'draft' | 'under_review' | 'published' | 'cancelled' | 'blocked' | 'past';
  isApproved: boolean;
  isSponsored?: boolean;
  tags?: string[];
  viewCount?: number;
  soldTickets?: number;
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
