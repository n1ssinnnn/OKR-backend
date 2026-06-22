export interface User {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId?: string | null;
    role?: string | null;
    departmentId: string;
    department: string;
    positionId: string;
    position: string;
    createdAt: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
}

export type Department = {
    id: string;
    name: string;
    createdAt: Date;
};

export type Position = {
    id: string;
    name: string;
    createdAt: Date;
};