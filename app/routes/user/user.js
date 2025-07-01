// app/routes/user/user.js
import express from "express";
import { userController } from "../../controllers/index.js";
import { auth } from "../../middlewares/jwt.js";

const router = express.Router();

router.get('/me', auth, userController.me);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post('/create-admin', userController.createAdmin);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

router.post('/forget-password', userController.forgetPassword);
router.post('/reset-password', userController.resetPassword);



export default router;
