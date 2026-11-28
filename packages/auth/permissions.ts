import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements } from 'better-auth/plugins/admin/access';
import type { UserRole } from '../domains/entities/user';

// Resources and the actions on them. Add OKR resources here as they are implemented.
export const statement = {
    ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

// Admin can do everything (adminAc leaves out "impersonate-admins", so the full statement is used)
export const admin = ac.newRole(statement);

// TODO: permissions for executive and manager are not decided yet
export const executive = ac.newRole({});
export const manager = ac.newRole({});

// Default role for new users; same as Better Auth's default "user" role (no admin permissions)
export const employee = ac.newRole({
    user: [],
    session: [],
});

// Keyed by UserRole so the roles here stay in sync with USER_ROLES
export const roles = { admin, executive, manager, employee } satisfies Record<UserRole, unknown>;
