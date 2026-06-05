import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { AuthService } from '../../src/business/services/auth.service';
import { resetResendVerificationTrackerForTests } from '../../src/business/services/auth.service';
import type { UserRepository } from '../../src/data-access/repositories/user.repository';
import type { JwtService } from '../../src/integration/auth/jwt.service';
import { AppError } from '../../src/shared/errors/app-error';
import { HTTP_STATUS } from '../../src/shared/constants/http-status';
import { emailService } from '../../src/integration/email/email-service';

vi.mock('bcrypt');
vi.mock('../../src/integration/email/email-service', () => ({
  emailService: {
    sendEmailVerificationCode: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: vi.Mocked<UserRepository>;
  let mockJwtService: vi.Mocked<JwtService>;

  beforeEach(() => {
    vi.resetAllMocks();
    resetResendVerificationTrackerForTests();

    mockUserRepository = {
      findByEmail: vi.fn(),
      findByEmailWithPassword: vi.fn(),
      findByEmailWithVerification: vi.fn(),
      create: vi.fn(),
      updateLastLoginAt: vi.fn(),
      updateEmailVerification: vi.fn(),
      updateUnverifiedRegistration: vi.fn(),
      deleteById: vi.fn(),
    } as unknown as vi.Mocked<UserRepository>;

    mockJwtService = {
      signToken: vi.fn(),
    } as unknown as vi.Mocked<JwtService>;

    authService = new AuthService(mockUserRepository, mockJwtService);
  });

  describe('register', () => {
    it('should throw conflict error if email already exists', async () => {
      mockUserRepository.findByEmailWithVerification.mockResolvedValue({
        _id: { toString: () => '1' },
        emailVerified: true,
      } as never);

      await expect(
        authService.register({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'student',
        })
      ).rejects.toThrow(new AppError('An account with this email already exists.', HTTP_STATUS.CONFLICT));
    });

    it('should reject registration when passwords do not match', async () => {
      await expect(
        authService.register({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'different123',
          role: 'student',
        }),
      ).rejects.toThrow(new AppError('Passwords do not match.', HTTP_STATUS.BAD_REQUEST));
    });

    it('should hash password, create user, and send a verification code', async () => {
      mockUserRepository.findByEmailWithVerification.mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
      mockUserRepository.create.mockResolvedValue({
        _id: '123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'student',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toString: () => '123',
      } as never);

      const result = await authService.register({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'student',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        emailVerified: false,
      }));
      expect(emailService.sendEmailVerificationCode).toHaveBeenCalledWith(
        'test@example.com',
        expect.stringMatching(/^\d{6}$/),
        expect.any(Date),
      );
      expect(result.email).toBe('test@example.com');
      expect(result.requiresEmailVerification).toBe(true);
    });

    it('should resend verification for an existing unverified email instead of creating a duplicate user', async () => {
      mockUserRepository.findByEmailWithVerification.mockResolvedValue({
        _id: { toString: () => 'existing-user-id' },
        email: 'test@example.com',
        emailVerified: false,
      } as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('rehashedPassword' as never);
      mockUserRepository.updateUnverifiedRegistration.mockResolvedValue({
        _id: { toString: () => 'existing-user-id' },
        email: 'test@example.com',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const result = await authService.register({
        fullName: 'Retried User',
        email: 'test@example.com',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
        role: 'student',
      });

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.deleteById).not.toHaveBeenCalled();
      expect(mockUserRepository.updateUnverifiedRegistration).toHaveBeenCalledWith(
        'existing-user-id',
        expect.objectContaining({
          fullName: 'Retried User',
          passwordHash: 'rehashedPassword',
          emailVerified: false,
          emailVerificationCode: expect.any(String),
          emailVerificationExpiresAt: expect.any(Date),
        }),
      );
      expect(emailService.sendEmailVerificationCode).toHaveBeenCalledWith(
        'test@example.com',
        expect.stringMatching(/^\d{6}$/),
        expect.any(Date),
      );
      expect(result).toEqual(
        expect.objectContaining({
          email: 'test@example.com',
          requiresEmailVerification: true,
          verificationExpiresAt: expect.any(Date),
        }),
      );
      expect(result).not.toHaveProperty('debugVerificationCode');
    });
  });

  describe('login', () => {
    it('should throw unauthorized error if user not found', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@example.com', password: 'password123' })
      ).rejects.toThrow(new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED));
    });

    it('should throw unauthorized error if password does not match', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue({
        passwordHash: 'hashedPassword',
        emailVerified: true,
      } as never);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongPassword' })
      ).rejects.toThrow(new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED));
    });

    it('should block login when the email is not verified', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue({
        passwordHash: 'hashedPassword',
        emailVerified: false,
      } as never);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(
        authService.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(new AppError('Please verify your email before logging in.', HTTP_STATUS.FORBIDDEN));
    });

    it('should return token and user on successful login', async () => {
      const mockUser = {
        _id: '123',
        id: '123',
        fullName: 'Test User',
        email: 'test@example.com',
        role: 'student',
        emailVerified: true,
        passwordHash: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        toString: () => '123',
      };
      
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(mockUser as never);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockJwtService.signToken.mockReturnValue('mock-jwt-token');

      const result = await authService.login({ email: 'test@example.com', password: 'password123' });

      expect(mockUserRepository.updateLastLoginAt).toHaveBeenCalledWith('123', expect.any(Date));
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email when the correct code is provided', async () => {
      const crypto = await import('crypto');
      const hashedCode = crypto.createHash('sha256').update('123456').digest('hex');

      mockUserRepository.findByEmailWithVerification.mockResolvedValue({
        _id: { toString: () => '123' },
        email: 'test@example.com',
        emailVerified: false,
        emailVerificationCode: hashedCode,
        emailVerificationExpiresAt: new Date(Date.now() + 60_000),
      } as never);
      mockUserRepository.updateEmailVerification.mockResolvedValue({} as never);

      const result = await authService.verifyEmail({
        email: 'test@example.com',
        code: '123456',
      });

      expect(mockUserRepository.updateEmailVerification).toHaveBeenCalledWith('123', {
        emailVerified: true,
        emailVerificationCode: undefined,
        emailVerificationExpiresAt: undefined,
      });
      expect(result).toEqual({
        email: 'test@example.com',
        emailVerified: true,
      });
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend a new verification code for an unverified user', async () => {
      mockUserRepository.findByEmailWithVerification.mockResolvedValue({
        _id: { toString: () => '123' },
        email: 'test@example.com',
        emailVerified: false,
      } as never);
      mockUserRepository.updateEmailVerification.mockResolvedValue({} as never);

      const result = await authService.resendVerificationEmail('test@example.com');

      expect(mockUserRepository.updateEmailVerification).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          emailVerified: false,
          emailVerificationCode: expect.any(String),
          emailVerificationExpiresAt: expect.any(Date),
        }),
      );
      expect(emailService.sendEmailVerificationCode).toHaveBeenCalledWith(
        'test@example.com',
        expect.stringMatching(/^\d{6}$/),
        expect.any(Date),
      );
      expect(result.email).toBe('test@example.com');
      expect(result.requiresEmailVerification).toBe(true);
    });

    it('should reject resend when the user does not exist', async () => {
      mockUserRepository.findByEmailWithVerification.mockResolvedValue(null);

      await expect(
        authService.resendVerificationEmail('missing@example.com'),
      ).rejects.toThrow(new AppError('No account was found for this email address.', HTTP_STATUS.NOT_FOUND));
    });

    it('should reject resend when the user is already verified', async () => {
      mockUserRepository.findByEmailWithVerification.mockResolvedValue({
        _id: { toString: () => '123' },
        email: 'test@example.com',
        emailVerified: true,
      } as never);

      await expect(
        authService.resendVerificationEmail('test@example.com'),
      ).rejects.toThrow(new AppError('This email address has already been verified.', HTTP_STATUS.BAD_REQUEST));
    });

    it('should rate limit resend attempts after three requests in ten minutes', async () => {
      mockUserRepository.findByEmailWithVerification.mockResolvedValue({
        _id: { toString: () => '123' },
        email: 'test@example.com',
        emailVerified: false,
      } as never);
      mockUserRepository.updateEmailVerification.mockResolvedValue({} as never);

      await authService.resendVerificationEmail('test@example.com');
      await authService.resendVerificationEmail('test@example.com');
      await authService.resendVerificationEmail('test@example.com');

      await expect(
        authService.resendVerificationEmail('test@example.com'),
      ).rejects.toThrow(
        new AppError(
          'Too many verification email requests. Please wait before trying again.',
          HTTP_STATUS.TOO_MANY_REQUESTS,
        ),
      );
    });
  });
});
