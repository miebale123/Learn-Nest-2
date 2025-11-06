import { registerAs } from '@nestjs/config';
import { envSchema } from './env.validation';
import z from 'zod';

export const configuration = registerAs('config', () => {
  try {
    const validated = envSchema.parse(process.env);

    return {
      frontEndLive: process.env.FRONTEND_LIVE,
      frontEndLocal: process.env.FRONTEND_LOCAL,
      nodeEnv: validated.NODE_ENV,
      port: validated.PORT,
      jwt_secret: validated.JWT_SECRET,
      jwt_expiry: validated.JWT_EXPIRES_IN,
      admin_email: validated.ADMIN_EMAIL,
      admin_pass: validated.ADMIN_PASS,

    database: {
        url: validated.DB_URL,
        host: validated.DB_HOST,
        port: validated.DB_PORT,
        user: validated.DB_USER,
        password: validated.DB_PASSWORD,
        name: validated.DB_NAME,
        synchronize: validated.DB_SYNCHRONIZE,
        logging: validated.DB_LOGGING,
        autoLoadEntities: validated.AUTOLOADENTITIES,
      },

      house: {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
      },
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      console.error('Validation errors:', err.issues);
    } else {
      console.error('Unexpected error:', err);
    }
    process.exit(1);
  }
});
