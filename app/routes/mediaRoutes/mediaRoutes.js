// app/routes/mediaRoutes/mediaRoutes.js
import express from 'express';
// import {  imageConversionMiddlewareMultiple,  videoUploadMiddleware} from '../../middlewares/upload.js';  

export default function mediaRoutes(app) {
  const router = express.Router();

  // router.post('/upload-images', imageConversionMiddlewareMultiple, (req, res) => {
  //   return res.status(200).json({
  //     message: 'Images uploaded & converted successfully',
  //     images: req.convertedFiles.images
  //   });
  // });

  // router.post('/upload-videos', videoUploadMiddleware, (req, res) => {
  //   return res.status(200).json({
  //     message: 'Videos uploaded successfully',
  //     videos: req.convertedFiles.videos
  //   });
  // });

  app.use('/api/media', router);
}
