import { UserModel, type User, type UserDocument } from '../models/user.model';

export class UserRepository {
  public create(data: Partial<User>): Promise<UserDocument> {
    return UserModel.create(data);
  }

  public findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }

  public findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email })
      .select('+passwordHash +emailVerificationCode +emailVerificationExpiresAt')
      .exec();
  }

  public findById(userId: string): Promise<UserDocument | null> {
    return UserModel.findById(userId).exec();
  }

  public findByEmailWithVerification(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email })
      .select('+emailVerificationCode +emailVerificationExpiresAt')
      .exec();
  }

  public updateLastLoginAt(userId: string, lastLoginAt: Date): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(userId, { lastLoginAt }, { new: true }).exec();
  }

  public updateEmailVerification(
    userId: string,
    payload: Pick<User, 'emailVerificationCode' | 'emailVerificationExpiresAt' | 'emailVerified'>,
  ): Promise<UserDocument | null> {
    const update: Record<string, unknown> = {
      emailVerified: payload.emailVerified,
    };

    if (payload.emailVerificationCode === undefined) {
      update.$unset = {
        emailVerificationCode: 1,
        emailVerificationExpiresAt: 1,
      };
    } else {
      update.emailVerificationCode = payload.emailVerificationCode;
      update.emailVerificationExpiresAt = payload.emailVerificationExpiresAt;
    }

    return UserModel.findByIdAndUpdate(userId, update, { new: true }).exec();
  }

  public updateUnverifiedRegistration(
    userId: string,
    payload: Pick<
      User,
      | 'fullName'
      | 'passwordHash'
      | 'role'
      | 'avatarUrl'
      | 'bio'
      | 'emailVerificationCode'
      | 'emailVerificationExpiresAt'
      | 'emailVerified'
    >,
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(
      userId,
      {
        fullName: payload.fullName,
        passwordHash: payload.passwordHash,
        role: payload.role,
        avatarUrl: payload.avatarUrl,
        bio: payload.bio,
        emailVerified: payload.emailVerified,
        emailVerificationCode: payload.emailVerificationCode,
        emailVerificationExpiresAt: payload.emailVerificationExpiresAt,
      },
      { new: true },
    ).exec();
  }

  public deleteById(userId: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndDelete(userId).exec();
  }
}
