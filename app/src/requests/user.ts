import { t } from "elysia"
import { QueryPagingValidator } from "./common";

export const userIdParams = t.Object({ id: t.String() })

export const listUsersQuery = t.Composite([
    QueryPagingValidator,
]);

export const createUserRequest = t.Object({
    firstName: t.String(),
    lastName: t.String(),
    email: t.String(),
    company: t.String(),
    role: t.String(),
    password: t.String(),
    confirmPassword: t.String(),
})