import {User} from "../entities/user.entity.ts";

export interface UserRepository {
	findById(id: string): Promise<User | null>;
}

export class UserMapper {
	static toDomain(raw: any): User {
		return new User({
			id: raw.id,
			name: raw.name,
      		firstName: raw.firstName,
      		lastName: raw.lastName,
			email: raw.email,
			roleId: raw.roleId,
			role: raw.role,
			departmentId: raw.departmentId,
			department: raw.department,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
			deletedAt: raw.deletedAt,
		});
	}

	static toPersistence(user: User): any {
		return {
			user_id: user.id,
			user_name: user.name,
      		first_name: user.firstName,
      		last_name: user.lastName,
			user_email: user.email,
			user_roleId: user.roleId,
			user_role: user.role,
			user_depId: user.departmentId,
			user_dep: user.department,
			user_create: user.createdAt,
			user_update: user.updatedAt,
			user_delete: user.deletedAt
		};
	}
}
