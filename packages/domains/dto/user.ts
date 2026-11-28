import type { User, UserRole } from "../entities/user";

export type SignInRequest = {
    email: string;
    password: string;
}

export type CreateUserRequest = {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    departmentId: string;
    positionId: string;
};

export type UpdateUserRequest = {
    departmentId: string;
    positionId: string;
    role: UserRole;
};

export type UpdateUserRoleRequest = {
    role: UserRole;
};

// Returned once to the admin; the password is stored only as a hash.
export type CreatedUserResult = {
    user: User;
    temporaryPassword: string;
};

export type ImportUsersResult = {
    total: number;
    users: CreatedUserResult[];
};

// One row of the import file: department and position are given by name, not id
export type ExcelUserRow = Omit<CreateUserRequest, 'departmentId' | 'positionId'> & {
    department: string;
    position: string;
};

export type ImportRowError = {
    row: number;
    field?: keyof ExcelUserRow;
    message: string;
};
