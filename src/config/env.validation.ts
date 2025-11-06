import z from 'zod';

const RequiredString = (message: string) =>
  z.string().trim().min(1, message).readonly();

const BooleanFromString = (defaultValue: boolean) =>
  z
    .preprocess(
      (val) =>
        typeof val === 'string' ? val.trim().toLowerCase() === 'true' : val,
      z.boolean(),
    )
    .default(defaultValue)
    .readonly();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'example']),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .min(1024)
    .max(65535)
    .default(5000)
    .readonly(),

  BCRYPT_SALT_ROUNDS: z.coerce
    .number()
    .int()
    .positive()
    .min(10, 'salt at least must be 10')
    .max(20, 'salt should not exceed 20')
    .readonly(),

  JWT_SECRET: RequiredString('secret is required'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  ADMIN_EMAIL: z.string(),
  ADMIN_PASS: z.string(),

  DB_URL: z.string(),
  DB_PORT: z.coerce.number().int().positive().min(1).max(65535).readonly(),
  DB_HOST: RequiredString('DB_HOST is required'),
  DB_USER: RequiredString('DB_USER is required'),
  DB_PASSWORD: RequiredString('DB_PASSWORD is required'),
  DB_NAME: RequiredString('DB_NAME is required'),
  DB_SYNCHRONIZE: BooleanFromString(false),
  DB_LOGGING: BooleanFromString(false),
  AUTOLOADENTITIES: BooleanFromString(true),
});
