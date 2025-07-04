// app/routes/index.js
import userRoutes from './user/user.js';  
import eventRoutes from './events/event.js';  
import artistRoutes from './lists/artiste.js';  
import bookingRoutes from './bookings/booking.js';  
import productRoutes from './products/product.js';  
import faqRoutes from './pageContent/faq.js';  
import policyRoutes from './pageContent/policyAndTerms.js';  
import quickLinkRoutes from './pageContent/quickLink.js';  
import ourServicesRoutes from './ourServices/ourServices.js';  

export default function setupRoutes(app) {
  app.use('/api/v1/auth', userRoutes);  
  app.use('/api/v1/events', eventRoutes);  
  app.use('/api/v1/artist', artistRoutes);  
  app.use('/api/v1/booking', bookingRoutes);  
  app.use('/api/v1/product', productRoutes);  
  app.use('/api/v1/faq', faqRoutes);  
  app.use('/api/v1/policy', policyRoutes);  
  app.use('/api/v1/quickLink', quickLinkRoutes);  
  app.use('/api/v1/ourService', ourServicesRoutes);  
}
