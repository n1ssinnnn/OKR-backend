import { Elysia } from 'elysia';
import { openapi } from '@elysia/openapi'

const app = new Elysia()

  .use(openapi({
    documentation: {
      tags: [
        { name: 'Authentication' },
        { name: 'User' },
      ]
    }
  }))

  .get('/', () => 'Hello Elysia', {
    detail: {
      tags: ['Authentication']
    }
  })

  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
