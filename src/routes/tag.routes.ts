import { Hono } from "hono";
import { getPostsByTag, getTags } from "../controllers/tag.controllers";

export const tagRouter = new Hono();

// Add routes for tag operations here

tagRouter.get('/getPostsByTag', getPostsByTag);
tagRouter.get('/tags', getTags);