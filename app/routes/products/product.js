// app/routes/productRoutes.js
import express from 'express';
import { productController } from '../../controllers/index.js';
import { auth, requireAdmin } from '../../middlewares/jwt.js';
import { mediaUploadMiddleware } from '../../middlewares/upload.js';

const router = express.Router();

router.get('/all-categories', auth, requireAdmin, productController.getAllCategory);

router.post('/add-product', auth, requireAdmin, mediaUploadMiddleware, productController.createProduct);
router.post('/category', auth, requireAdmin, productController.createCategory);
router.post('/order', auth, productController.placeOrder);
router.get('/analytics', auth, requireAdmin, productController.getProductAnalytics);
router.put('/:id', auth, requireAdmin, mediaUploadMiddleware, productController.updateProduct);
router.delete('/:id', auth, requireAdmin, productController.deleteProduct);

router.get('/category/:id', auth, requireAdmin, productController.getCategoryById);
router.put('/category/:id', auth, requireAdmin, productController.updateCategory);
router.get('/all-orders', auth, requireAdmin, productController.getAllOrders);
router.get('/products', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.post('/razorpay/order', auth, productController.createRazorpayOrder);
router.post('/order/verify-payment', auth, productController.verifyAndPlaceOrder);


export default router;