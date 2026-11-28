import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@db';
import { config } from '@infra';
import * as schema from '@db/schema';
import { admin } from 'better-auth/plugins';
import { ac, roles } from './permissions';

export const auth = betterAuth({
  baseURL: config.API_BASE_URL,
  trustedOrigins: [...config.AUTH_TRUSTED_ORIGINS],
  secret: config.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg', // or "mysql", "sqlite"
    schema,
  }),
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        required: true,
        input: true,
      },
      lastName: {
        type: 'string',
        required: true,
        input: true,
      },
      departmentId: {
        type: 'string',
        required: true,
        input: true,
      },
      positionId: {
        type: 'string',
        required: true,
        input: true,
      },
      // false = soft-deleted (DELETE /api/v1/user/:id). Set by admins only, never by sign-up/update input.
      isActive: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // Accounts are created only by admins (POST /api/v1/user, /user/import)
    disableSignUp: true,
  },
  plugins: [
    admin({
      ac,
      roles,
      // Better Auth's default is 'user', which is not a UserRole
      defaultRole: 'employee',
    }),
  ],
});
