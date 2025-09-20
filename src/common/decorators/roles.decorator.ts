import { ENUM_USER_ROLE } from '@modules/user/dtos/user.dto';
import { SetMetadata } from '@nestjs/common';

// Re-export the enum from user entity for consistency
export const Role = ENUM_USER_ROLE;
export type Role = ENUM_USER_ROLE;

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ENUM_USER_ROLE[]) =>
    SetMetadata(ROLES_KEY, roles);
