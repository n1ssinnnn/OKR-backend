import { db } from "../db";
import { user, type Schema } from "../db/schema";
import { ORDER_DIRECTION, type OrderingParams, type PagingParams, type PagingResult } from "../domains/entities/common";
import type { User } from "../domains/entities/user";
import { count } from 'drizzle-orm';
import { buildPagingResult } from "../domains/helper/paging";

type UserQueryRow = typeof Schema.user.$inferSelect

export class UserRepository {

    mapToEntity(row: UserQueryRow): User {
        return {
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            name: row.name,
            email: row.email,
            emailVerified: row.emailVerified,
            image: row.image,
            role: row.role,
            departmentId: row.departmentId,
            positionId: row.positionId,
            status: row.isActive,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            banned: row.banned,
            banReason: row.banReason,
            banExpires: row.banExpires,
        };
    }

    // Find by ID
    async findById(id: string): Promise<User | null> {
        const row = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.id, id),
        });

        if (!row) {
            return null;
        }

        return this.mapToEntity(row as UserQueryRow);
    }

    // Find by email
    async findByEmail(email: string): Promise<User | null> {
        const row = await db.query.user.findFirst({
            where: (user, { eq }) => eq(user.email, email),
        });

        if (!row) {
            return null;
        }

        return this.mapToEntity(row as UserQueryRow);
    }

    // Find All
    async findAll(paging: PagingParams, ordering: OrderingParams<User>): Promise<PagingResult<User>> {
        const orderByKey =
            ordering.orderBy as keyof typeof Schema.user.$inferSelect;
        const isAsc = ordering.orderDirection === ORDER_DIRECTION.ASC;

        const [rows, countResult] = await Promise.all([
            db.query.user.findMany({
                orderBy: (users, { asc, desc }) =>
                    isAsc ? asc(users[orderByKey]) : desc(users[orderByKey]),
                limit: paging.perPage,
                offset: (paging.page - 1) * paging.perPage,
            }),
            db.select({ total: count() }).from(user)
        ])

        return buildPagingResult(
            rows.map((row) => this.mapToEntity(row as UserQueryRow)),
            Number(countResult[0]?.total ?? 0),
            paging,
        );
    }

}