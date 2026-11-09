import { Elysia } from 'elysia';
import { auth } from '../../../packages/auth/auth';
import { Errors } from '../../../packages/domains/errors';

export const requireAuth = new Elysia({ name: 'require-auth' })
    // This middleware is installed as a plugin, so mark its hooks as scoped
    // to make them apply to routes registered after `.use(requireAuth)`.
    .derive(
        { as: 'scoped' },
        async ({ request }) => ({
            authSession: await auth.api.getSession({
                headers: request.headers,
            }),
        }),
    )
    .onBeforeHandle({ as: 'scoped' }, ({ authSession }) => {
        if (!authSession) {
            throw new Errors.Unauthorized('Sign-in is required');
        }
    });
