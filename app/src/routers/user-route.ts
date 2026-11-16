import { Elysia } from 'elysia';
import type { User } from '../../../packages/domains/entities/user';
import { createUserRequest, importUsersRequest, listUsersQuery } from '../requests/user';
import type { OrderDirection, OrderingParams } from '../../../packages/domains/entities/common';
import { userService } from '../service-di';
import { requireAuth } from '../middleware/require-auth';
import { requireAdmin } from '../middleware/require-admin';
import { Errors } from '../../../packages/domains/errors';

export const userRoute = new Elysia({
    prefix: '/user',
    detail: {
        tags: ['User']
    }
})
    // Provides the typed `authSession` used by `requireAdmin`
    .use(requireAuth)

    .get('/',
        async ({ query }) => {
            const paging = {
                page: Number(query.page),
                perPage: Number(query.perPage),
            };
            const order: OrderingParams<User> = {
                orderBy: query.orderBy as keyof User,
                orderDirection: query.orderDirection as OrderDirection,
            };
            return await userService.getAllUsers(paging, order);
        },
        {
            query: listUsersQuery,
        }
    )

    .post('/',
        async ({ body, set }) => {
            const result = await userService.createUser(body);
            set.status = 201;
            return result;
        },
        {
            beforeHandle: requireAdmin,
            body: createUserRequest,
        }
    )

    .post('/import',
        async ({ body: { file }, set }) => {
            if (!file.name.toLowerCase().endsWith('.xlsx')) {
                throw new Errors.BadRequest('Only .xlsx files are supported');
            }
            const result = await userService.importUsersFromExcel(file);
            set.status = 201;
            return result;
        },
        {
            beforeHandle: requireAdmin,
            body: importUsersRequest,
        }
    )
