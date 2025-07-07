import express from 'express';
import { eventController } from '../../controllers/index.js';
import { mediaUploadMiddleware } from '../../middlewares/upload.js';
import { auth, requireAdmin } from '../../middlewares/jwt.js';

const router = express.Router();

// Create event (image + video upload middleware)
router.post('/post', auth, requireAdmin, mediaUploadMiddleware, eventController.createEvent);

// Get all events
router.get('/', eventController.getAllEvents);

// for admin get all
router.get('/getAll', auth, requireAdmin, eventController.getAllEventsAdmin);

// Get single event
router.get('/:id', eventController.getEventById);

// Update event
router.put('/:id', auth, requireAdmin, mediaUploadMiddleware, eventController.updateEvent);

// Delete event
router.delete('/:id', auth, requireAdmin, eventController.deleteEvent);

router.patch('/:id/toggle-active', auth, requireAdmin, eventController.toggleEventActive);


export default router;
