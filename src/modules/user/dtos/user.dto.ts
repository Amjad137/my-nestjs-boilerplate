import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    IsEnum,
    IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { BaseEntityDto } from '@common/database/dtos/base.dto';

export enum ENUM_USER_ROLE {
    USER = 'user',
    ADMIN = 'admin',
}
export class CreateUserDto {
    @ApiProperty({ example: 'John' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '+1234567890' })
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ example: '123 Main St, City, Country' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({ example: 'Test@123', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({
        example: 'user',
        enum: ENUM_USER_ROLE,
        description: 'User role (admin can only be set by existing admin)',
        default: 'user',
    })
    @IsEnum(ENUM_USER_ROLE)
    @IsOptional()
    role?: ENUM_USER_ROLE;
}

export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['password', 'role'] as const),
) {
    @ApiPropertyOptional({ example: 'abc123def456' })
    @IsOptional()
    @IsString()
    passwordResetToken?: string;

    @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
    @IsOptional()
    passwordResetExpires?: Date;

    @ApiPropertyOptional({ example: 'xyz789' })
    @IsOptional()
    @IsString()
    emailVerificationToken?: string;

    @ApiPropertyOptional({ example: 'salt123' })
    @IsOptional()
    @IsString()
    salt?: string;
}

export class UpdatePasswordDto {
    @ApiProperty({ example: 'hashed-password-value', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    hashedPassword: string;

    @ApiProperty({ example: 'salt-value' })
    @IsString()
    @IsNotEmpty()
    salt: string;

    @ApiPropertyOptional({ example: 'abc123def456' })
    @IsOptional()
    @IsString()
    passwordResetToken?: string;

    @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
    @IsOptional()
    passwordResetExpires?: Date;
}
export class UserResponseDto extends PartialType(BaseEntityDto) {
    @ApiProperty({ example: 'john@example.com' })
    email: string;

    @ApiProperty({ example: '+1234567890' })
    phoneNumber: string;

    @ApiProperty({ example: 'John' })
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    lastName: string;

    @ApiProperty({ example: '123 Main St, City, Country' })
    address: string;

    @ApiProperty({ example: 'user', enum: ENUM_USER_ROLE })
    role: ENUM_USER_ROLE;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    avatar?: string;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ example: false })
    isEmailVerified: boolean;

    @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
    lastLoginAt?: Date;
}
