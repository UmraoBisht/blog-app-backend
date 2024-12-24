import { Hono } from "hono";
import { createPost, deletePost, getAllPosts, getPost, getPostsByUserId, updatePost } from "../controllers/post.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

export const postRouter = new Hono();

postRouter.post('/post/:id', getPost)
postRouter.get('/all-posts', getAllPosts);
postRouter.get('/posts', authMiddleware, getPostsByUserId);
postRouter.post('/create-post', authMiddleware, createPost);
postRouter.put('/post/:id', authMiddleware, updatePost);
postRouter.delete('/post/:id', authMiddleware, deletePost);