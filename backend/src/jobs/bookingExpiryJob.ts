import cron from 'node-cron';
import { markExpiredBookingsAsFailed } from '../controllers/bookingController';

// Run every minute to check for expired bookings
export const startBookingExpiryJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const expiredCount = await markExpiredBookingsAsFailed();
      if (expiredCount > 0) {
        console.log(`Marked ${expiredCount} bookings as expired`);
      }
    } catch (error) {
      console.error('Error in booking expiry job:', error);
    }
  });
};
