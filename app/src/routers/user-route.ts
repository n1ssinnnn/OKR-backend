import { Elysia } from 'elysia';
import { User } from '../../../packages/domains/entities/user';
import { listUsersQuery } from '../requests/user';
import type { OrderDirection, OrderingParams } from '../../../packages/domains/entities/common';
import { userService } from '../service-di';

export const userRoute = new Elysia({
    prefix: '/user',
    detail: {
        tags: ['User']
    }
})

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