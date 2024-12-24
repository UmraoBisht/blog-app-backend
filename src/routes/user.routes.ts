import { Hono } from "hono";
import { getUserProfile, getAllUsers } from "../controllers/user.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";


export const userRouter = new Hono();

userRouter.get("/profile", authMiddleware, getUserProfile);
userRouter.get("/all-users", getAllUsers);

