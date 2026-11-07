import { Elysia } from 'elysia';
import { openapi } from '@elysia/openapi'
import { authRoute } from './routers/auth-route';

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

  // API routes 
  .group('/api/v1', (app) => app.use(authRoute))

  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
