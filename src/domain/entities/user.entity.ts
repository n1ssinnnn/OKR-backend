import type { CheckIn } from "./checkin.entity";
import type { Objective } from "./objective.entity";

export interface User {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleId: string;
    role: string;
    teamId?: string | null
    departmentId: string;
    department: string;
    checkIns?: CheckIn[];
    objectives?: Objective[];
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}