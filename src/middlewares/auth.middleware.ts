import { Context, Next } from "hono";
import { Jwt } from "hono/utils/jwt";


export const authMiddleware = async (c: Context, next: Next) => {
    try {
        const token = c.req.header("Authorization")?.split(' ')[1];
        if (!token) {
            return c.json({ status: "error", message: "Invalid Authorization token" }, 403);
        }
        // Verify the token using a JWT library
        const decodedToken = await Jwt.verify(token, c.env.JWT_SECRET);
        // If the token is valid, return the decoded token
        if (decodedToken == null || decodedToken === undefined) {
            return c.json({ status: "error", message: "Invalid Authorization token" }, 403);
        }
        c.set("userId", decodedToken);
        await next();

    } catch (error) {
        return c.json({ status: "error", message: "Invalid Authorization token", error }, 403);
    }
}
