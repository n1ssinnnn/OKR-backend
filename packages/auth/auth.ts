import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@db';
import { config } from '@infra';
import * as schema from '@db/schema';
import { admin } from 'better-auth/plugins';

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
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin()],
});
