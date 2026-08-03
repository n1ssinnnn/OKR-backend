import type { Role } from "./role.entity";
import type { Department } from "./department.entity";
import type { CheckIn } from "./checkin.entity";
import type { Objective } from "./objective.entity";
import type { Position } from "./position.entity";

export interface User {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleId?: string | null;
    role?: Role | null;
    teamId?: string | null
    departmentId: string;
    department: Department;
    positionId: string;
    position: Position;
    checkIns?: CheckIn[];
    objectives?: Objective[];
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}