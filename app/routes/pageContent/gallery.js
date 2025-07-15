import express from 'express';
import { galleryController } from '../../controllers/index.js';
import { mediaUploadMiddleware } from '../../middlewares/upload.js';
import { requireAdmin } from '../../middlewares/jwt.js';

const router = express.Router();

router.get('/', galleryController.getAllGalleries);
router.get('/:id', galleryController.getGalleryById);
router.post('/',  mediaUploadMiddleware, galleryController.createGallery);
router.put('/:id',  mediaUploadMiddleware, galleryController.updateGallery);
router.delete('/:id',  galleryController.deleteGallery);

export default router;
