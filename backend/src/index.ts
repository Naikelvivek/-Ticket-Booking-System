import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/bookingRoutes';
import userRoutes from './routes/userRoutes';
import { initializeDatabase } from './database/schema';
import { startBookingExpiryJob } from './jobs/bookingExpiryJob';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);
app.use('/api', userRoutes);

app.get('/', (_req, res) => {
  res.send('Ticket Booking Backend');
});

const start = async () => {
  try {
    await initializeDatabase();
    startBookingExpiryJob();

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
