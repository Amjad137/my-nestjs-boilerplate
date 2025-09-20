import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        example: 'oldTest@123',
        description: 'Current password',
    })
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @ApiProperty({
        example: 'Test@123',
        description: 'New password (minimum 8 characters)',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, {
        message: 'New password must be at least 8 characters long',
    })
    newPassword: string;
}

export class ForgotPasswordDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsString()
    @IsNotEmpty()
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty({
        example: 'abc123def456',
        description: 'Password reset token',
    })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({
        example: 'Test@123',
        description: 'New password (minimum 8 characters)',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, {
        message: 'New password must be at least 8 characters long',
    })
    newPassword: string;
}

export class PasswordResetResponseDto {
    @ApiProperty({
        example: 'Password changed successfully',
        description: 'Success message',
    })
    message: string;

    @ApiProperty({
        example: '2024-01-15T10:30:00.000Z',
        description: 'Timestamp when password was changed',
    })
    timestamp: string;
}
