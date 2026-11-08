import type { auth as Auth } from "../auth/auth";
import type { SignInRequest } from "../domains/dto/user";

export class AuthService {
    constructor(
        private readonly auth: typeof Auth,
    ) { }

    async signIn(input: SignInRequest) {

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

        const response = await this.auth.api.signOut({
            headers,
            asResponse: true
        })

        return response
    }
}
