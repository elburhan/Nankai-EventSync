export const USER_ROLES = ['student', 'organizer', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];
