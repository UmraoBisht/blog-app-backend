import { z } from 'zod';


export const createPostSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }).max(80),
    content: z.string().min(1, { message: 'Content is required' }).max(500),
})

export const updatePostSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }).max(80),
    content: z.string().min(1, { message: 'Content is required' }).max(500),
})

