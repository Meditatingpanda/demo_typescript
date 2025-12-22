import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import redisClient from './services/redis.service';
import { errorMiddleware } from './middlewares/error.middleware';
import chatRoute from './routes/chat.route';



dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
// redis connections
redisClient.connect();

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
// routes
app.use('/api', chatRoute);

// Global error handling middleware
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
