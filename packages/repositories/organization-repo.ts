import { inArray, sql } from 'drizzle-orm';
import { db } from '../db';
import { department, position } from '../db/schema';

export type DepartmentRef = { id: string };
export type PositionRef = { id: string; departmentId: string };
export type NamedDepartment = { id: string; name: string };
export type NamedPosition = { id: string; name: string; departmentId: string };

export class OrganizationRepository {

    // Find departments whose id is in the given list
    async findDepartmentsByIds(ids: string[]): Promise<DepartmentRef[]> {
        if (ids.length === 0) return [];
        return db
            .select({ id: department.id })
            .from(department)
            .where(inArray(department.id, ids));
    }

    // Find positions whose id is in the given list
    async findPositionsByIds(ids: string[]): Promise<PositionRef[]> {
        if (ids.length === 0) return [];
        return db
            .select({ id: position.id, departmentId: position.departmentId })
            .from(position)
            .where(inArray(position.id, ids));
    }

    // Find departments by name (case-insensitive)
    async findDepartmentsByNames(names: string[]): Promise<NamedDepartment[]> {
        if (names.length === 0) return [];
        const lowered = [...new Set(names.map((n) => n.toLowerCase()))];
        return db
            .select({ id: department.id, name: department.name })
            .from(department)
            .where(inArray(sql`lower(${department.name})`, lowered));
    }

    // Find every position that belongs to one of the given departments
    async findPositionsByDepartmentIds(departmentIds: string[]): Promise<NamedPosition[]> {
        if (departmentIds.length === 0) return [];
        return db
            .select({ id: position.id, name: position.name, departmentId: position.departmentId })
            .from(position)
            .where(inArray(position.departmentId, departmentIds));
    }
}
