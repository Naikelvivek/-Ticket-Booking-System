export interface Show {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  total_seats: number;
  category: 'show' | 'bus' | 'doctor';
  created_at: string;
  updated_at: string;
  seats?: Seat[];
}

export interface Seat {
  id: string;
  show_id: string;
  seat_number: string;
  status: 'available' | 'booked' | 'reserved';
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  show_id: string;
  user_id: string;
  number_of_seats: number;
  booked_seats: string[];
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  created_at: string;
  expires_at?: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthContextType {
  userId: string | null;
  isAdmin: boolean;
  login: (userId: string, isAdmin?: boolean) => void;
  logout: () => void;
}

export interface BookingContextType {
  shows: Show[];
  bookings: Booking[];
  selectedSeats: string[];
  loading: boolean;
  error: string | null;
  fetchShows: (category?: string) => Promise<void>;
  fetchShowById: (id: string) => Promise<Show | null>;
  bookSeats: (showId: string, numberOfSeats: number, requestedSeats?: string[]) => Promise<Booking | null>;
  confirmBooking: (bookingId: string) => Promise<boolean>;
  fetchUserBookings: (userId: string) => Promise<void>;
  setSelectedSeats: (seats: string[]) => void;
  clearError: () => void;
}
