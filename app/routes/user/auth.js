// app/routes/user/user.js
import express from "express";
import { authController } from "../../controllers/index.js";
import { auth, requireAdmin } from "../../middlewares/jwt.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post('/create-admin', authController.createAdmin);

router.delete('/:id', auth, requireAdmin, authController.deleteUser);

router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
