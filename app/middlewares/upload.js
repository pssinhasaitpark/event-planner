// app/middlewares/mediaMiddleware.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_PATH = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(BASE_PATH)) fs.mkdirSync(BASE_PATH, { recursive: true });

/* ------------------------ Multer Storage & Filters ------------------------ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, BASE_PATH),
  filename: (req, file, cb) => {
    const safeName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${safeName}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const validVideoTypes = ['video/mp4', 'video/avi', 'video/mkv', 'video/mov'];
  const isValid = [...validImageTypes, ...validVideoTypes].includes(file.mimetype);

  isValid ? cb(null, true) : cb(new Error('Invalid file type.'));
};

const uploadAll = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB max
  }
}).fields([
  { name: 'images', maxCount: 1 },
  { name: 'galary', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]);

/* ------------------------ Unified Upload Middleware ------------------------ */

export const mediaUploadMiddleware = (req, res, next) => {
  uploadAll(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const BASE_URL = '/media';
      const convertedImages = [];

      // Merge banner and galary
      const imageFiles = [...(req.files?.images || []), ...(req.files?.galary || [])];

      for (const file of imageFiles) {
        const safeName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '');
        const webpName = `${Date.now()}-${safeName}.webp`;
        const webpPath = path.join(BASE_PATH, webpName);

        await sharp(file.path)
          .webp({ quality: 80 })
          .toFile(webpPath);

        fs.unlinkSync(file.path); // remove original
        convertedImages.push(`${BASE_URL}/${webpName}`);
      }

      const videoUrls = (req.files?.videos || []).map(file => `${BASE_URL}/${file.filename}`);

      req.convertedFiles = {
        images: convertedImages,
        videos: videoUrls
      };

      next();
    } catch (error) {
      console.error('Media processing failed:', error);
      return res.status(500).json({ message: 'Media processing error.' });
    }
  });
};

/* ------------------------ File Delete Utility ------------------------ */

export const deleteFiles = async (urls = []) => {
  for (const url of urls) {
    const fileName = path.basename(url);
    const filePath = path.join(BASE_PATH, fileName);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
        console.log(`Deleted: ${filePath}`);
      } catch (err) {
        console.error(`Delete failed for ${filePath}:`, err);
      }
    }
  }
};
