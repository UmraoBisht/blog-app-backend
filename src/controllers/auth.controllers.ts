import bcrypt from 'bcryptjs'
import { Context } from "hono";
import { getPrisma } from "../utils/prismaFunction";
import { signinSchema, signupSchema } from "../zod/authSchema";
import { Jwt } from 'hono/utils/jwt';

enum StatusCode {
    BADREQ = 400,
    NOTFOUND = 404,
    FORBIDDEN = 403,
    UNAUTHORIZED = 401,
    SERVER_ERROR = 500,
}


export const signin = async (c: Context) => {
    const { email, password } = await c.req.json();
    const response = signinSchema.safeParse({ email, password });
    if (!response.success) {
        return c.json({ status: "error", message: response.error.message }, StatusCode.BADREQ);
    }
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
        });
        if (!user) {
            return c.json({ status: "error", message: "User not found!" }, StatusCode.NOTFOUND)
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return c.json({ status: "error", message: "Invalid password!" }, StatusCode.UNAUTHORIZED)
        }
        const token =await Jwt.sign({ userId: user.id }, c.env.JWT_SECRET);
        return c.json({
            status: "success",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error: any) {
        // console.error(error);
        return c.json({ status: "error", message: "Internal Server Error" }, StatusCode.SERVER_ERROR);

    }
}
export const signup = async (c: Context) => {
    const { username, email, password } = await c.req.json();
    const response = signupSchema.safeParse({ username, email, password });
    if (!response.success) {
        return c.json({ status: "error", message: response.error.message }, StatusCode.BADREQ);
    }
    const prisma = getPrisma(c.env.DATABASE_URL);

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (user) {
            return c.json({ status: "error", message: "Email already exists!" }, StatusCode.BADREQ);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });
        return c.json({
            status: "success",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error: any) {
        // console.error(error);
        return c.json({ status: "error", message: "Internal Server Error",error }, StatusCode.SERVER_ERROR);
    }
}