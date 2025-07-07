// app/routes/user/user.js
import express from "express";
import { userController } from "../../controllers/index.js";
import { auth, requireAdmin, } from "../../middlewares/jwt.js";

const router = express.Router();

router.get('/me', auth, userController.me);

router.get('/users', auth, requireAdmin, userController.getUsers);
router.get('/:id', auth, requireAdmin, userController.getUserById);
router.put('/:id', auth,userController.updateUser);


export default router;
