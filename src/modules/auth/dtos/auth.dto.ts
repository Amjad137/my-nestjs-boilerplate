import { ApiProperty, PickType } from '@nestjs/swagger';
import { CreateUserDto, UserResponseDto } from '@modules/user/dtos/user.dto';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'Test@123' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RegisterDto extends PickType(CreateUserDto, [
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'address',
    'password',
    'avatar',
]) {}
export class AuthResponseDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    accessToken: string;

    @ApiProperty({
        example: {
            _id: '507f1f77bcf86cd799439011',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phoneNumber: '+1234567890',
            address: '123 Main St, City, Country',
            role: 'user',
            isActive: true,
            isEmailVerified: false,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        },
    })
    user: UserResponseDto;
}
