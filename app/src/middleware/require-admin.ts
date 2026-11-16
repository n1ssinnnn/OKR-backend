import { auth } from '../../../packages/auth/auth';
import { Errors } from '../../../packages/domains/errors';

type AuthSession = typeof auth.$Infer.Session;

// Route-level `beforeHandle` for admin-only endpoints.
// `authSession` comes from `requireAuth`, so the route must be registered after it.
export const requireAdmin = ({ authSession }: { authSession: AuthSession | null }) => {
    if (!authSession) {
        throw new Errors.Unauthorized('Sign-in is required');
    }
    if (authSession.user.role !== 'admin') {
        throw new Errors.Forbidden('Only admin can create users');
    }
};
