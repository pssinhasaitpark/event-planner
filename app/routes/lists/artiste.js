
// app/routes/artistRoutes.js
import express from 'express';
import { listController } from '../../controllers/index.js';
import { auth, requireAdmin } from '../../middlewares/jwt.js';
import { mediaUploadMiddleware } from '../../middlewares/upload.js';    

const router = express.Router();

router.get('/', listController.getAllArtists);
router.get('/:id', listController.getArtistById);
router.post('/', auth, requireAdmin, mediaUploadMiddleware, listController.createArtist);
router.put('/:id', auth, requireAdmin,listController.updateArtist);
router.delete('/:id', auth, requireAdmin,listController.deleteArtist);

export default router;
