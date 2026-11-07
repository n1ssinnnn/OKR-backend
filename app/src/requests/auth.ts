import { t } from "elysia"

export const signInRequest = t.Object({
    email: t.String({ format: 'email' }),
    password: t.String({ minLength: 1 }),
});