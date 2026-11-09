import { Elysia } from 'elysia';
import { authService } from '../service-di';
import { signInRequest } from '../requests/auth';

export const signInRoute = new Elysia({
    prefix: '/auth',
    detail: {
        tags: ['Authentication']
    }
})
    .post('/sign-in',
        async ({ body, request: { headers } }) => {
            const user = await authService.signIn(body, headers);
            return user
        },
        {
            body: signInRequest
        }
    );

export const signOutRoute = new Elysia({
    prefix: '/auth',
    detail: { tags: ['Authentication'] },
})
    .post('/sign-out', async ({ request: { headers } }) => {
        return authService.signOut(headers);
    }
    );