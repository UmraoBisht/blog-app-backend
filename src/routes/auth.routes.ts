import { Hono } from "hono";
import { signin, signup } from "../controllers/auth.controllers";


export const authRouter = new Hono();

authRouter.post("/signup",signup);
authRouter.post("/signin",signin);

