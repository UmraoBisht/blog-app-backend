import { Context } from "hono";
import { getPrisma } from "../utils/prismaFunction";
import { createPostSchema, updatePostSchema } from "../zod/postSchema";

enum StatusCode {
    BADREQ = 400,
    NOTFOUND = 404,
    FORBIDDEN = 403,
    UNAUTHORIZED = 401,
    SERVER_ERROR = 500,
}



export const getPost = async (c: Context) => {
    const { req } = c;
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { id } = req.param();
    const post = await prisma.post.findUnique({ where: { id: Number(id), authorId: c.get('userId') } });
    if (!post) {
        return c.json({ status: "error", message: "Post not found!" }, StatusCode.NOTFOUND);
    }
    return c.json({ status: "success", data: post });
}

export const getPostsByUserId = async (c: Context) => {

    const prisma = getPrisma(c.env.DATABASE_URL);
    const { userId } = c.get("userId");
    try {
        const posts = await prisma.post.findMany({
            where: {
                authorId: Number(userId),
            }
        });
        if (!posts) {
            return c.json({ status: "error", message: "No post found!" }, StatusCode.NOTFOUND);
        }
        return c.json({ status: "success", data: posts });
    } catch (error) {
        return c.json({ status: "error", message: "Error fetching posts!" }, StatusCode.SERVER_ERROR);
    }

}


export const getAllPosts = async (c: Context) => {
    const prisma = getPrisma(c.env.DATABASE_URL);
    try {
        const posts = await prisma.post.findMany();
        if (!posts) {
            return c.json({ status: "error", message: "No post found!" }, StatusCode.NOTFOUND);
        }
        return c.json({ status: "success", data: posts });
    } catch (error) {
        return c.json({ status: "error", message: "Error fetching posts!" }, StatusCode.SERVER_ERROR);
    }
}

export const createPost = async (c: Context) => {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { title, content, tags } = await c.req.json();
    const result = createPostSchema.safeParse({ title, content });
    if (!result.success) {
        return c.json({ status: "error", message: "Invalid request data!" }, StatusCode.BADREQ);
    }

    const tagNames = tags.split(',').map((tagName: string) => tagName.trim());
    const { userId } = c.get('userId');

    try {
        const post = await prisma.post.create({
            data: {
                title,
                content,
                authorId: parseInt(userId),
                tags: {
                    create: tagNames.map((tag: string) => ({
                        tag: {
                            connectOrCreate: {
                                where: { name: tag },
                                create: { name: tag },
                            },
                        },
                    })),
                },
            },
            include: {
                tags: true
            }
        });
        return c.json({ status: "success", data: post });

    } catch (error) {
        return c.json({ status: "error", message: "Error creating post!", error }, StatusCode.SERVER_ERROR);
    }

}



export const updatePost = async (c: Context) => {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { title, content } = await c.req.json();
    const result = updatePostSchema.safeParse({ title, content });
    if (!result.success) {
        return c.json({ status: "error", message: "Invalid request data!" }, StatusCode.BADREQ);
    }
    const { userId } = c.get("userId");
    const postId = c.req.param("id");
    try {
        const isPostExist = await prisma.post.findFirst({
            where: {
                id: Number(postId),
                authorId: Number(userId),
            },
        });
        if (!isPostExist) {
            return c.json({ status: "error", message: "Post not found!" }, StatusCode.NOTFOUND);
        }
        const updatedPost = await prisma.post.update({
            where: { id: isPostExist.id },
            data: {
                title,
                content
            }
        });
        return c.json({ status: "success", data: updatedPost });

    } catch (error) {
        return c.json({ status: "error", message: "Error updating post!" }, StatusCode.SERVER_ERROR);
    }

}

export const deletePost = async (c: Context) => {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const postId = c.req.param("id");
    const { userId } = c.get("userId");
    try {
        const isPostExist = await prisma.post.findFirst({
            where: {
                id: Number(postId),
                authorId: Number(userId),
            },
        });
        if (!isPostExist) {
            return c.json({ status: "error", message: "Post not found!" }, StatusCode.NOTFOUND);
        }
        await prisma.postTag.deleteMany({ where: { postId: isPostExist.id } });
        await prisma.post.delete({ where: { id: isPostExist.id } });

        return c.json({ status: "success", message: "Post deleted successfully!" });
    } catch (error) {
        return c.json({ status: "error", message: "Error deleting post!", error }, StatusCode.SERVER_ERROR);
    }
}
