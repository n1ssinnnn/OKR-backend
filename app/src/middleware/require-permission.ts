import { auth } from '../../../packages/auth/auth';
import { statement } from '../../../packages/auth/permissions';
import type { UserRole } from '../../../packages/domains/entities/user';
import { Errors } from '../../../packages/domains/errors';

type AuthSession = typeof auth.$Infer.Session;
type Statement = typeof statement;
// e.g. { user: ['create'] }: resources and actions from packages/auth/permissions.ts
type Permissions = { [R in keyof Statement]?: Statement[R][number][] };

// Route-level `beforeHandle` that checks the signed-in user's role against the roles in
// packages/auth/permissions.ts, using Better Auth's admin plugin.
// `authSession` comes from `requireAuth`, so the route must be registered after it.
export const requirePermission = (permissions: Permissions) =>
    async ({ authSession }: { authSession: AuthSession | null }) => {
        if (!authSession) {
            throw new Errors.Unauthorized('Sign-in is required');
        }

        // Passing userId and role (not headers) checks the role from the session
        // already loaded by requireAuth, without another session lookup
        const result = await auth.api.userHasPermission({
            body: {
                userId: authSession.user.id,
                // The user table types role as UserRole; Better Auth's session types it as string
                role: authSession.user.role as UserRole,
                permissions,
            },
        });

        if (!result.success) {
            throw new Errors.Forbidden('You do not have permission to perform this action');
        }
    };
