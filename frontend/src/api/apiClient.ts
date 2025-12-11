import axios, { AxiosInstance } from 'axios';
import { Show, Booking, Seat, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });
  }

  private getCacheKey(method: string, url: string): string {
    return `${method}:${url}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    Array.from(this.cache.keys()).forEach((key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  async getShows(category?: string): Promise<Show[]> {
    const cacheKey = this.getCacheKey('GET', `/shows?category=${category || ''}`);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const params = category ? { category } : undefined;
      const response = await this.axiosInstance.get<ApiResponse<Show[]>>('/shows', { params });
      if (response.data.success) {
        this.setCache(cacheKey, response.data.data || []);
        return response.data.data || [];
      }
      throw new Error(response.data.error || 'Failed to fetch shows');
    } catch (error) {
      console.error('Error fetching shows:', error);
      throw error;
    }
  }

  async getShowById(showId: string): Promise<Show | null> {
    const cacheKey = this.getCacheKey('GET', `/shows/${showId}`);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.axiosInstance.get<ApiResponse<Show>>(`/shows/${showId}`);
      if (response.data.success && response.data.data) {
        this.setCache(cacheKey, response.data.data);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching show:', error);
      throw error;
    }
  }

  async getAvailableSeats(showId: string): Promise<Seat[]> {
    const cacheKey = this.getCacheKey('GET', `/shows/${showId}/available-seats`);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.axiosInstance.get<ApiResponse<Seat[]>>(
        `/shows/${showId}/available-seats`
      );
      if (response.data.success) {
        this.setCache(cacheKey, response.data.data || []);
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching available seats:', error);
      throw error;
    }
  }

  async createShow(
    name: string,
    description: string,
    startTime: string,
    totalSeats: number,
    category: 'show' | 'bus' | 'doctor'
  ): Promise<Show> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<Show>>('/shows', {
        name,
        description,
        start_time: startTime,
        total_seats: totalSeats,
        category,
      });
      if (response.data.success && response.data.data) {
        this.invalidateCache('shows');
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to create show');
    } catch (error) {
      console.error('Error creating show:', error);
      throw error;
    }
  }

  async bookSeats(
    showId: string,
    userId: string,
    numberOfSeats: number,
    requestedSeats?: string[]
  ): Promise<Booking> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<Booking>>('/bookings', {
        show_id: showId,
        user_id: userId,
        number_of_seats: numberOfSeats,
        requested_seats: requestedSeats,
      });
      if (response.data.success && response.data.data) {
        this.invalidateCache('seats');
        this.invalidateCache('bookings');
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to book seats');
    } catch (error) {
      console.error('Error booking seats:', error);
      throw error;
    }
  }

  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<Booking>>(
        `/bookings/${bookingId}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  async confirmBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<Booking>>(
        `/bookings/${bookingId}/confirm`
      );
      if (response.data.success && response.data.data) {
        this.invalidateCache('bookings');
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to confirm booking');
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const cacheKey = this.getCacheKey('GET', `/users/${userId}/bookings`);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.axiosInstance.get<ApiResponse<Booking[]>>(
        `/users/${userId}/bookings`
      );
      if (response.data.success) {
        this.setCache(cacheKey, response.data.data || []);
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  async getAllBookings(): Promise<any[]> {
    const cacheKey = this.getCacheKey('GET', `/bookings`);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;
    try {
      const response = await this.axiosInstance.get<ApiResponse<any[]>>(`/bookings`);
      if (response.data.success) {
        this.setCache(cacheKey, response.data.data || []);
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  async register(username: string, password: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<any>>('/register', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  async login(username: string, password: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<any>>('/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }
}

export default new ApiClient();
