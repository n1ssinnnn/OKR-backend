import { Elysia } from 'elysia';

export const authRoute = new Elysia({
    prefix: '/auth',
    detail: {
        tags: ['Authentication']
    }
})

    .get('/sign-up', () => "Halo")