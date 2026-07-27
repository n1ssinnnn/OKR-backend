import {User} from "./src/domain/entities/user.entity.ts";

export interface UserRepository {
	findById(id: string): Promise<User | null>;
	export class UserMapper {
  		static toDomain(raw: any): User {
    		return new User(
      			raw.id,
				raw.name,
      			raw.firstName,
      			raw.lastName,
				raw.email,
				raw.roleId,
				raw.role,
				raw.departmentId,
				raw.department,
				raw.positionId,
				raw.position,
				raw.createdAt,
				raw.updatedAt,
				raw.deletedAt
    		);
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
				user_posId: user.positionId,
				user_pos: user.position,
				user_create: user.createdAt,
				user_update: user.updatedAt,
				user_delete: user.deletedAt
    		};
  		}
}
}
