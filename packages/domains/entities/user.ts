export const USER_ROLES = ['admin', 'executive', 'manager', 'employee'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type UserStatus = boolean

export type User = {
    id: string
    firstName: string
    lastName: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    role: UserRole
    departmentId: string
    positionId: string
    status: UserStatus
    createdAt: Date;
    updatedAt: Date;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
}