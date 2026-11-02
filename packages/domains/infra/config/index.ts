function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
}

export const config = {
    DATABASE_URL: requireEnv('DATABASE_URL'),
    API_BASE_URL: requireEnv('API_BASE_URL'),
    PORT: Number(process.env.PORT ?? 3000),
    AUTH_TRUSTED_ORIGINS: (
        process.env.AUTH_TRUSTED_ORIGINS ?? 'http://localhost:3001/'
    )
        .split(',')
        .map((s) => s.trim()),
    BETTER_AUTH_SECRET: requireEnv('BETTER_AUTH_SECRET'),
    BETTER_AUTH_URL: requireEnv('BETTER_AUTH_URL'),
    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000/',
} as const;