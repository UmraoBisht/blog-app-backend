import { z } from "zod";

export const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const signupSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
});