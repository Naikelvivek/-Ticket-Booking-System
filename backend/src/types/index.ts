export interface Show {
  id: string;
  name: string;
  description?: string;
  start_time: Date;
  total_seats: number;
  category: 'show' | 'bus' | 'doctor';
  created_at: Date;
  updated_at: Date;
}

export interface Seat {
  id: string;
  show_id: string;
  seat_number: string;
  status: 'available' | 'booked' | 'reserved';
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: string;
  show_id: string;
  user_id: string;
  number_of_seats: number;
  booked_seats: string[];
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  created_at: Date;
  expires_at?: Date;
  updated_at: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
