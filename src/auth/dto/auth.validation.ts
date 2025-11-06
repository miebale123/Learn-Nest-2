import { z, ZodError, ZodType } from 'zod';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SigninDto,
  SignupDto,
  UpdatePasswordDto,
} from './auth-credentials.dto';
import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class GlobalZodPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // skip if no class type
    if (!metadata.metatype) return value;

    // get the Zod schema from our registry
    const schema = AppRegistry.get(metadata.metatype.name);
    if (!schema) return value;

    try {
      // parse and validate
      return schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        // flatten the Zod error for clean API output
        const flat = z.flattenError(err);

        throw new BadRequestException({
          message: 'Validation failed',
          fieldErrors: flat.fieldErrors,
          formErrors: flat.formErrors,
        });
      }
      throw err;
    }
  }
}

export const AppRegistry = new Map<string, ZodType>();

export function registerSchema(id: string, schema: ZodType) {
  if (!AppRegistry.has(id)) AppRegistry.set(id, schema);
  schema.meta({ id });
  return schema;
}

export const preprocessEmail = (val: unknown) =>
  typeof val === 'string' ? val.toLowerCase().trim() : val;

export const PasswordSchema = z
  .string({ error: () => ({ message: 'password is required' }) })
  .min(8, { message: 'please enter at least 8 characters' })
  .max(20, { message: 'password must be at most 20 characters' })
  .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/, {
    message:
      'please enter password that contains uppercase, lowercase, number, and symbol',
  });
export const SignupSchema = registerSchema(
  SignupDto.name,
  z
    .object({
      email: z.preprocess(
        preprocessEmail,
        z.email({ message: 'enter a valid email' }),
      ),
      password: z.string(),
    })
    .strict(),
);

export const SigninSchema = registerSchema(
  SigninDto.name,
  z
    .object({
      email: z.preprocess(
        preprocessEmail,
        z.email({ message: 'enter a valid email' }),
      ),
      password: z.string({
        error: () => ({ message: 'password is required' }),
      }),
    })
    .strict(),
);

export const ForgotPasswordSchema = registerSchema(
  ForgotPasswordDto.name,
  z
    .object({
      email: z.preprocess(
        preprocessEmail,
        z.email({ message: 'enter a valid email' }),
      ),
    })
    .strict(),
);

export const ResetPasswordSchema = registerSchema(
  ResetPasswordDto.name,
  z
    .object({
      email: z.preprocess(
        preprocessEmail,
        z.email({ message: 'enter a valid email' }),
      ),
      newPassword: PasswordSchema,
    })
    .strict(),
);

export const UpdatePasswordSchema = registerSchema(
  UpdatePasswordDto.name,
  z
    .object({
      oldPassword: z.string({
        error: () => ({ message: 'old password is required' }),
      }),
      newPassword: PasswordSchema,
    })
    .strict(),
);

export type Signup = z.infer<typeof SignupSchema>;
export type Signin = z.infer<typeof SigninSchema>;
export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type UpdatePassword = z.infer<typeof UpdatePasswordSchema>;
