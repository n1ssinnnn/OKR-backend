import type { OrderingParams, PagingParams, PagingResult } from "../domains/entities/common";
import type { User } from "../domains/entities/user";
import { Errors } from "../domains/errors";
import type { UserRepository } from "../repositories/user-repo";

export class UserService {
    constructor(
        private readonly userRepo: UserRepository
    ) { }

    // getAll
    async getAllUsers(paging: PagingParams, ordering: OrderingParams<User>): Promise<PagingResult<User>> {
        try {
            const users = await this.userRepo.findAll(paging, ordering);
            return users
        }

        catch (error: unknown) {
            if (error instanceof Errors.ApiError) throw error;
            const err = error as {
                statusCode?: number;
                status?: number;
                message?: string;
            }
            throw new Errors.InternalServerError(err?.message ?? 'Failed to get all users')
        }
    }

    // getById
    async getUserById(id: string): Promise<User | null> {
        try {
            const user = await this.userRepo.findById(id);
            if (!user) {
                throw new Errors.NotFound('User not found')
            }
            return user
        }

        catch (error: unknown) {
            if (error instanceof Errors.ApiError) throw error;
            const err = error as {
                statusCode?: number;
                status?: number;
                message?: string;
            }
            throw new Errors.InternalServerError(err?.message ?? 'Failed to get user by id')
        }
    }
}