import express from 'express';
import { ourServicesController } from '../../controllers/index.js';
import { auth, requireAdmin } from '../../middlewares/jwt.js';



const router = express.Router();

router.post('/', auth, requireAdmin, ourServicesController.createService);
router.get('/', ourServicesController.getAllServices);
router.put('/:id', auth, requireAdmin, ourServicesController.updateService);
router.delete('/:id', auth, requireAdmin, ourServicesController.deleteService);

export default router;
