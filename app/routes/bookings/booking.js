
// app/routes/bookingRoutes.js
import express from 'express';
import { bookingController } from '../../controllers/index.js';
import { auth, requireAdmin } from '../../middlewares/jwt.js';

const router = express.Router();

router.post('/create', auth, bookingController.createBooking);
router.post('/verify', auth, bookingController.verifyPayment);
router.get('/scan/:data', bookingController.scanQrCode);
router.get('/', auth, requireAdmin, bookingController.getAllBookings);
router.get('/analytics/event', auth, requireAdmin, bookingController.getEventDetailedAnalytics);


export default router;