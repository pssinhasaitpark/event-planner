// app/routes/index.js
import userRoutes from './user/user.js';  
import eventRoutes from './events/event.js';  
import artistRoutes from './lists/artiste.js';  
import bookingRoutes from './bookings/booking.js';  

export default function setupRoutes(app) {
  app.use('/api/v1/auth', userRoutes);  
  app.use('/api/v1/events', eventRoutes);  
  app.use('/api/v1/artist', artistRoutes);  
  app.use('/api/v1/booking', bookingRoutes);  
}
