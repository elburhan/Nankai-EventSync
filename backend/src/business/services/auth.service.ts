import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { UserRepository } from '../../data-access/repositories/user.repository';
import { JwtService } from '../../integration/auth/jwt.service';
import { env } from '../../integration/config/env';
import { emailService } from '../../integration/email/email-service';
import { HTTP_STATUS } from '../../shared/constants/http-status';
import { AppError } from '../../shared/errors/app-error';
import { logger } from '../../shared/utils/logger';
import type {
  AuthResponseDto,
  AuthenticatedUserDto,
  RegistrationVerificationDto,
  ResendVerificationResponseDto,
  VerifyEmailResponseDto,
} from '../dto/auth-response.dto';
import type { UserRole } from '../../shared/constants/user-role';

interface RegisterUserInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Extract<UserRole, 'student' | 'organizer'>;
  avatarUrl?: string;
  bio?: string;
}

interface LoginUserInput {
  email: string;
  password: string;
}

interface VerifyEmailInput {
  email: string;
  code: string;
}

const EMAIL_VERIFICATION_WINDOW_MS = 15 * 60 * 1000;
const RESEND_VERIFICATION_WINDOW_MS = 10 * 60 * 1000;
const RESEND_VERIFICATION_LIMIT = 3;
const resendVerificationTracker = new Map<string, number[]>();

export const resetResendVerificationTrackerForTests = (): void => {
  resendVerificationTracker.clear();
};

export class AuthService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly jwtService = new JwtService(),
  ) {}

  public async register(input: RegisterUserInput): Promise<RegistrationVerificationDto> {
    if (input.password !== input.confirmPassword) {
      throw new AppError('Passwords do not match.', HTTP_STATUS.BAD_REQUEST);
    }

    const existingUser = await this.userRepository.findByEmailWithVerification(input.email);

    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new AppError('An account with this email already exists.', HTTP_STATUS.CONFLICT);
      }

      return this.reissueVerificationForExistingUnverifiedUser(existingUser._id.toString(), input);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const { code: verificationCode, codeHash: verificationCodeHash, expiresAt: verificationExpiresAt } =
      this.buildVerificationCodePayload();

    const user = await this.userRepository.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role: input.role,
      emailVerified: false,
      emailVerificationCode: verificationCodeHash,
      emailVerificationExpiresAt: verificationExpiresAt,
      avatarUrl: input.avatarUrl,
      bio: input.bio,
    });

    try {
      await emailService.sendEmailVerificationCode(input.email, verificationCode, verificationExpiresAt);
    } catch (error) {
      logger.error(
        {
          err: error,
          email: input.email,
        },
        'Failed to send verification email during registration.',
      );

      await this.userRepository.deleteById(user._id.toString());
      throw new AppError(
        'We could not send the verification email. Please try registering again.',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      email: user.email,
      requiresEmailVerification: true,
      verificationExpiresAt,
      ...(env.NODE_ENV !== 'production' ? { debugVerificationCode: verificationCode } : {}),
    };
  }

  public async resendVerificationEmail(email: string): Promise<ResendVerificationResponseDto> {
    this.assertResendLimit(email);
    this.trackResendAttempt(email);

    const user = await this.userRepository.findByEmailWithVerification(email);

    if (!user) {
      throw new AppError('No account was found for this email address.', HTTP_STATUS.NOT_FOUND);
    }

    if (user.emailVerified) {
      throw new AppError('This email address has already been verified.', HTTP_STATUS.BAD_REQUEST);
    }

    const { code, codeHash, expiresAt } = this.buildVerificationCodePayload();

    await this.userRepository.updateEmailVerification(user._id.toString(), {
      emailVerified: false,
      emailVerificationCode: codeHash,
      emailVerificationExpiresAt: expiresAt,
    });

    try {
      await emailService.sendEmailVerificationCode(user.email, code, expiresAt);
    } catch {
      throw new AppError(
        'We could not resend the verification email right now. Please try again shortly.',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      email: user.email,
      requiresEmailVerification: true,
      verificationExpiresAt: expiresAt,
      ...(env.NODE_ENV !== 'production' ? { debugVerificationCode: code } : {}),
    };
  }

  public async verifyEmail(input: VerifyEmailInput): Promise<VerifyEmailResponseDto> {
    const user = await this.userRepository.findByEmailWithVerification(input.email);

    if (!user) {
      throw new AppError('No account was found for this email address.', HTTP_STATUS.NOT_FOUND);
    }

    if (user.emailVerified) {
      return {
        email: user.email,
        emailVerified: true,
      };
    }

    if (!user.emailVerificationCode || !user.emailVerificationExpiresAt) {
      throw new AppError('No active verification code was found. Please register again.', HTTP_STATUS.BAD_REQUEST);
    }

    if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
      throw new AppError('This verification code has expired. Please register again.', HTTP_STATUS.BAD_REQUEST);
    }

    const submittedCodeHash = this.hashVerificationCode(input.code);

    if (submittedCodeHash !== user.emailVerificationCode) {
      throw new AppError('The verification code is incorrect.', HTTP_STATUS.BAD_REQUEST);
    }

    await this.userRepository.updateEmailVerification(user._id.toString(), {
      emailVerified: true,
      emailVerificationCode: undefined,
      emailVerificationExpiresAt: undefined,
    });

    return {
      email: user.email,
      emailVerified: true,
    };
  }

  public async login(input: LoginUserInput): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmailWithPassword(input.email);

    if (!user) {
      throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.emailVerified) {
      throw new AppError('Please verify your email before logging in.', HTTP_STATUS.FORBIDDEN);
    }

    await this.userRepository.updateLastLoginAt(user.id, new Date());

    const sanitizedUser = this.mapUser(user);

    return {
      token: this.jwtService.signToken({ id: sanitizedUser.id, role: sanitizedUser.role }),
      user: sanitizedUser,
    };
  }

  private mapUser(user: {
    _id: { toString(): string };
    fullName: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
    avatarUrl?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
  }): AuthenticatedUserDto {
    return {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateVerificationCode(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  private hashVerificationCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private buildVerificationCodePayload(): {
    code: string;
    codeHash: string;
    expiresAt: Date;
  } {
    const code = this.generateVerificationCode();

    return {
      code,
      codeHash: this.hashVerificationCode(code),
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_WINDOW_MS),
    };
  }

  private async reissueVerificationForExistingUnverifiedUser(
    userId: string,
    input: RegisterUserInput,
  ): Promise<RegistrationVerificationDto> {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const { code, codeHash, expiresAt } = this.buildVerificationCodePayload();

    const user = await this.userRepository.updateUnverifiedRegistration(userId, {
      fullName: input.fullName,
      passwordHash,
      role: input.role,
      avatarUrl: input.avatarUrl,
      bio: input.bio,
      emailVerified: false,
      emailVerificationCode: codeHash,
      emailVerificationExpiresAt: expiresAt,
    });

    if (!user) {
      throw new AppError('No account was found for this email address.', HTTP_STATUS.NOT_FOUND);
    }

    try {
      await emailService.sendEmailVerificationCode(input.email, code, expiresAt);
    } catch (error) {
      logger.error(
        {
          err: error,
          email: input.email,
        },
        'Failed to resend verification email for an existing unverified registration.',
      );

      throw new AppError(
        'We could not send the verification email. Please try again.',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      email: user.email,
      requiresEmailVerification: true,
      verificationExpiresAt: expiresAt,
    };
  }

  private assertResendLimit(email: string): void {
    const now = Date.now();
    const recentAttempts = (resendVerificationTracker.get(email) ?? [])
      .filter((timestamp) => now - timestamp < RESEND_VERIFICATION_WINDOW_MS);

    resendVerificationTracker.set(email, recentAttempts);

    if (recentAttempts.length >= RESEND_VERIFICATION_LIMIT) {
      throw new AppError(
        'Too many verification email requests. Please wait before trying again.',
        HTTP_STATUS.TOO_MANY_REQUESTS,
      );
    }
  }

  private trackResendAttempt(email: string): void {
    const now = Date.now();
    const recentAttempts = (resendVerificationTracker.get(email) ?? [])
      .filter((timestamp) => now - timestamp < RESEND_VERIFICATION_WINDOW_MS);

    recentAttempts.push(now);
    resendVerificationTracker.set(email, recentAttempts);
  }
}
