import { t } from "elysia"
import { QueryPagingValidator } from "./common";
import { USER_ROLES } from "../../../packages/domains/entities/user";

export const userIdParams = t.Object({ id: t.String() })

export const listUsersQuery = t.Composite([
    QueryPagingValidator,
]);

const requiredText = t.String({ minLength: 1, pattern: '\\S' }) // not empty or whitespace only

export const createUserRequest = t.Object({
    firstName: requiredText,
    lastName: requiredText,
    email: t.String({ format: 'email' }),
    role: t.UnionEnum(USER_ROLES),
    departmentId: requiredText,
    positionId: requiredText,
})

export const updateUserRequest = t.Object({
    departmentId: requiredText,
    positionId: requiredText,
    role: t.UnionEnum(USER_ROLES),
})

export const updateUserRoleRequest = t.Object({
    role: t.UnionEnum(USER_ROLES),
})

export const importUsersRequest = t.Object({
    file: t.File({ maxSize: '5m' }),
})
