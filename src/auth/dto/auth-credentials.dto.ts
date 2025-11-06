export class SignupDto {
  email!: string;
  password!: string;
}
export class SigninDto {
  email!: string;
  password!: string;
}
export class ForgotPasswordDto {
  email!: string;
}
export class ResetPasswordDto {
  newPassword!: string;
  confirmPassword: string;
}

export class UpdatePasswordDto {
  oldPassword!: string;
  newPassword!: string;
}

export class VerificationDto {
  otp: string;
}
