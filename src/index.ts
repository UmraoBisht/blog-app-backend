import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './routes/auth.routes';
import { postRouter } from './routes/post.routes';
import { tagRouter } from './routes/tag.routes';
import { userRouter } from './routes/user.routes';


const app = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    }
    Variables: {
        userId: string
    }
}>();

app.use(cors());
app.route('/api/v1/auth', authRouter);
app.route('/api/v1/user', userRouter);
app.route('/api/v1/posts', postRouter);
app.route('/api/v1/tags', tagRouter);

export default app;
