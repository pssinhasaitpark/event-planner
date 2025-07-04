import express from 'express';
import { quickLinkController } from '../../controllers/index.js';
import { auth, requireAdmin } from '../../middlewares/jwt.js';


const router = express.Router();

router.post('/', auth, requireAdmin, quickLinkController.createQuickLink);

router.get('/', quickLinkController.getAllQuickLinks);

router.delete('/:id', auth, requireAdmin, quickLinkController.deleteQuickLink);

export default router;
