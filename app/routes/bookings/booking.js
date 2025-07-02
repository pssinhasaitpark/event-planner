
// app/routes/bookingRoutes.js
import express from 'express';
import { bookingController } from '../../controllers/index.js';
import { auth, requireAdmin } from '../../middlewares/jwt.js';

const router = express.Router();

router.post('/create', auth, bookingController.createBooking);
router.post('/verify', auth, bookingController.verifyPayment);
router.get('/scan/:data', bookingController.scanQrCode);
router.get('/analytics', auth, requireAdmin, bookingController.getEventAnalytics);

export default router;