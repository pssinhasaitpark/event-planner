import express from 'express';
import { faqController } from '../../controllers/index.js';
import { auth, requireAdmin } from '../../middlewares/jwt.js';


const router = express.Router();


router.post('/', auth, requireAdmin, faqController.createFAQ);
router.get('/', faqController.getAllFAQs);
router.delete('/:id', auth, requireAdmin, faqController.deleteFAQ);

export default router;
