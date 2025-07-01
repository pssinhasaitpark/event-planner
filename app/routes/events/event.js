import express from 'express';
import { eventController } from '../../controllers/index.js';
import { mediaUploadMiddleware } from '../../middlewares/upload.js';
import { auth, requireAdmin } from '../../middlewares/jwt.js';

const router = express.Router();

// Create event (image + video upload middleware)
router.post('/post', auth, requireAdmin, mediaUploadMiddleware, eventController.createEvent);

// Get all events
router.get('/', eventController.getAllEvents);

// Get single event
router.get('/:id', eventController.getEventById);

// Update event
router.put('/:id', auth, requireAdmin, eventController.updateEvent);

// Delete event
router.delete('/:id', auth, requireAdmin, eventController.deleteEvent);

export default router;
