import {User} from "./src/domain/entities/user.entity.ts";

export interface UserRepository {
	findById(id: string): Promise<User | null>;	
}
