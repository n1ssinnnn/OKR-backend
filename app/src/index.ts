import { Elysia } from 'elysia';
import { openapi } from '@elysia/openapi'
import { cors } from '@elysia/cors'
import { auth } from '../../packages/auth/auth';
import { userRoute } from './routers/user-route';
import { signInRoute, signOutRoute } from './routers/auth-route';
import { requireAuth } from './middleware/require-auth';

const app = new Elysia()

  // Open API
  .use(openapi({
    documentation: {
      tags: [
        { name: 'Authentication' },
        { name: 'User' },
      ]
    }
  }))

  // CORS
  .use(
    cors({
      origin: "http://localhost:3001",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )

  // mount
  .mount(auth.handler)

  // API routes 
  .group('/api/v1', (app) =>
    app
      .use(signInRoute)
      .use(requireAuth)
      .use(signOutRoute)
      .use(userRoute)
  )

  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
