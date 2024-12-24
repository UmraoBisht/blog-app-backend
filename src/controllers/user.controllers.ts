import { Context } from "hono";
import { getPrisma } from "../utils/prismaFunction";

enum StatusCode {
    BADREQ = 400,
    NOTFOUND = 404,
    FORBIDDEN = 403,
    UNAUTHORIZED = 401,
    SERVER_ERROR = 500,
}


export const getUserProfile = async (c: Context) => {
    const { userId } = c.get("userId");
    const prisma = getPrisma(c.env.DATABASE_URL);
    try {
        const user = await prisma.user.findUnique({
            omit: {
                password: true,
            },
            where: {
                id: parseInt(userId),
            },
        });
        if (!user) {
            return c.json({ message: "User not found" }, StatusCode.NOTFOUND);
        }
        return c.json({ status: "success", user });

    } catch (error) {
        // console.error(error);
        return c.json({ status: "error", message: "Internal Server Error" }, StatusCode.SERVER_ERROR);
    }
}


export const getAllUsers = async (c: Context) => {
    const prisma = getPrisma(c.env.DATABASE_URL);
    try {
        const users = await prisma.user.findMany({
            omit: {
                password: true
            }
        });
        return c.json({ status: "success", users });
    } catch (error) {
        // console.error(error);
        return c.json({ status: "error", message: "Internal Server Error" }, StatusCode.SERVER_ERROR);
    }
}