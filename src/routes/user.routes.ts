import { Router } from "express";
import * as userController from "../controllers/user.controller";
import validate from "../middlewares/validate";
import { createUserSchema, loginUserSchema } from "../schemas/user.schema";
import { authLimiter } from "../middlewares/rateLimiter";
import { authMiddleware } from "../middlewares/auth";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "../schemas/profile.schema";

const router = Router();

const AuthLimiter = process.env.NODE_ENV !== 'test' ? authLimiter : (req: any, res: any, next: any) => next();

router.post("/register", AuthLimiter, validate(createUserSchema), userController.register);
router.post("/login", AuthLimiter, validate(loginUserSchema), userController.login);
router.post("/logout", authMiddleware, userController.logout);

router.get("/me", authMiddleware, userController.getProfile);
router.put("/me", authMiddleware, validate(updateProfileSchema), userController.updateProfile);
router.put("/me/password", authMiddleware, validate(changePasswordSchema), userController.changePassword);

export default router;
