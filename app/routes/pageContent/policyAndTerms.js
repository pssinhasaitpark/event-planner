import express from 'express';
import { policyController } from '../../controllers/index.js';
import { auth, requireAdmin } from '../../middlewares/jwt.js';


const router = express.Router();

router.post('/', auth, requireAdmin, policyController.upsertPolicy);

router.get('/:type', policyController.getPolicyByType);

export default router;
