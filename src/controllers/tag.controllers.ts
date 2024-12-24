import { Context } from "hono";
import { getPrisma } from "../utils/prismaFunction";

enum StatusCode {
    BADREQ = 400,
    NOTFOUND = 404,
    FORBIDDEN = 403,
    UNAUTHORIZED = 401,
    SERVER_ERROR = 500,
}

export const getTags = async (c: Context) => {
    const prisma = getPrisma(c.env.DATABASE_URL);
    try {
        const tags = await prisma.tags.findMany();
        return c.json({ status: "success", tags: tags });
    } catch (error) {
        return c.json({ status: "error", message: "Internal server error" }, StatusCode.SERVER_ERROR);
    }
}

export const getPostsByTag = async (c: Context) => {
    const prisma = getPrisma(c.env.DATABASE_URL);
    try {
        const posts = await prisma.tags.findMany({
            select: {
                posts: {
                    select: {

                        post: {
                            select: {
                                content: true,
                                createdAt: true,
                                authorId: true,
                                author: {
                                    select: {
                                        username: true
                                    }
                                },
                            }
                        }

                    }
                }

            },
            where: {
                name: c.req.param('tag')
            },
        })
        return c.json({ status: "success", posts: posts });
    } catch (error: any) {
        return c.json({ status: "error", message: "Internal server error" }, StatusCode.SERVER_ERROR);
    }
}