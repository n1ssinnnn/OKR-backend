import type { CheckIn } from "./checkin.entity";
import type { Objective } from "./objective.entity";
import type { Department } from "./department.entity";
import type { Role } from "./role.entity";

export interface User {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleId: string;
    role: Role;
    teamId?: string | null
    departmentId: string;
    department: Department;
    checkIns?: CheckIn[];
    objectives?: Objective[];
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}

export interface AuthPayload {
    userId: string
    email: string
    role: string
}

export interface LoginResult {
    accessToken: string
    user: Omit<User, "password">
}