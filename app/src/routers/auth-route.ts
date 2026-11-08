import { Elysia } from 'elysia';
import { authService } from '../service-di';
import { signInRequest } from '../requests/auth';

export const authRoute = new Elysia({
    prefix: '/auth',
    detail: {
        tags: ['Authentication']
    }
})

    .post('/sign-up',
        async ({ body }) => {
            const user = await authService.signIn(body);
            return user
        },
        {
            body: signInRequest
        }
    )