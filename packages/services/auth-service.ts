import type { auth as Auth } from "../auth/auth";
import type { SignInRequest } from "../domains/dto/user";
import { Errors } from "../domains/errors";

export class AuthService {
    constructor(
        private readonly auth: typeof Auth,
    ) { }

    async signIn(input: SignInRequest, headers: Headers) {

        // User already signed in
        const existingSession = await this.auth.api.getSession({ headers })
        if (existingSession) {
            throw new Errors.Conflict('User is already signed in.');
        }

        // Sign-in
        const response = await this.auth.api.signInEmail({
            body: {
                email: input.email,
                password: input.password,
            },
            asResponse: true // returns a response object instead of data
        });

        return response
    }

    async signOut(headers: Headers) {

        // No active session ( do not signed in )
        const session = await this.auth.api.getSession({ headers })
        if (!session) {
            throw new Errors.Unauthorized('No active session found');
        }

        // Sign-out
        const response = await this.auth.api.signOut({
            headers,
            asResponse: true
        })

        return response
    }
}
