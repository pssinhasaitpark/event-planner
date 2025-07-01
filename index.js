// index.js
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io'; 
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import connectDB from './app/config/db.js';
import setupRoutes from './app/routes/index.js';
import mediaRoutes from './app/routes/mediaRoutes/mediaRoutes.js';
import handleCitySocket from './app/sockets/citiesSockets.js';  

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);  
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://192.168.0.132:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Static Media
app.use('/media', express.static(path.join(__dirname, 'uploads')));

// Connect DB
connectDB();

// Routes
app.get('/', (req, res) => res.json({ message: 'Welcome to Events', error: false }));
setupRoutes(app);
mediaRoutes(app);

// Setup sockets
handleCitySocket(io);  

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
