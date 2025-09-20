import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
    UserDocument,
    UserEntity,
} from '@modules/user/repository/entities/user.entity';
import { RootFilterQuery, Types } from 'mongoose';
import {
    CreateUserDto,
    UpdateUserDto,
    UserResponseDto,
    UpdatePasswordDto,
    ENUM_USER_ROLE,
} from '@modules/user/dtos/user.dto';
import { UserRepository } from '@modules/user/repository/repositories/user.repository';
import {
    IPaginationQuery,
    IPaginationResult,
} from '@common/database/interfaces/database.interface';
import { ChangePasswordDto } from '@modules/auth/dtos/password-reset.dto';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const { email, password, ...userData } = createUserDto;

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const savedUser = await this.userRepository.create({
            ...userData,
            email,
            password: hashedPassword,
            salt,
            role: userData.role || ENUM_USER_ROLE.USER,
        });

        return this.toResponseDto(savedUser);
    }

    async findAll(
        query?: IPaginationQuery,
    ): Promise<IPaginationResult<UserResponseDto>> {
        const result = (await this.userRepository.findAll(
            { isActive: true },
            {
                paginationQuery: query,
                searchFields: ['firstName', 'lastName', 'email'],
                availableSortFields: [
                    'firstName',
                    'lastName',
                    'email',
                    'createdAt',
                    'updatedAt',
                ],
                defaultSortField: 'createdAt',
            },
        )) as IPaginationResult<UserDocument>;

        return {
            ...result,
            data: result.data.map(user => this.toResponseDto(user)),
        };
    }

    async findAllSimple(): Promise<UserResponseDto[]> {
        const users = (await this.userRepository.findAll(
            { isActive: true },
            { order: { createdAt: -1 } },
        )) as UserDocument[];

        return users.map(user => this.toResponseDto(user));
    }

    async findOne(
        filter: RootFilterQuery<UserEntity>,
    ): Promise<UserResponseDto> {
        const user = await this.userRepository.findOne(filter);
        if (!user || !user.isActive) {
            throw new NotFoundException('User not found');
        }
        return this.toResponseDto(user);
    }

    async findById(id: string | Types.ObjectId): Promise<UserResponseDto> {
        const normalizedId =
            typeof id === 'string' ? new Types.ObjectId(id) : id;
        const user = await this.userRepository.findOneById(normalizedId);
        if (!user || !user.isActive) {
            throw new NotFoundException('User not found');
        }
        return this.toResponseDto(user);
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userRepository.findByEmail(email);
    }

    async findByPhoneNumber(phoneNumber: string): Promise<UserDocument | null> {
        return this.userRepository.findOne({ phoneNumber });
    }

    async findByPasswordResetToken(
        token: string,
    ): Promise<UserDocument | null> {
        return this.userRepository.findOne({
            passwordResetToken: token,
            isActive: true,
        });
    }

    async update(
        id: string | Types.ObjectId,
        updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        const normalizedId =
            typeof id === 'string' ? new Types.ObjectId(id) : id;
        const user = await this.userRepository.updateOneById(
            normalizedId,
            updateUserDto,
        );

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.toResponseDto(user);
    }

    async changePassword(
        id: string | Types.ObjectId,
        changePasswordDto: ChangePasswordDto,
    ): Promise<void> {
        const { currentPassword, newPassword } = changePasswordDto;

        const normalizedId =
            typeof id === 'string' ? new Types.ObjectId(id) : id;
        const user = await this.userRepository.findOneById(normalizedId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password,
        );
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Generate salt and hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await this.userRepository.updateOneById(normalizedId, {
            password: hashedNewPassword,
            salt,
        });
    }

    async updatePassword(
        id: string | Types.ObjectId,
        updatePasswordDto: UpdatePasswordDto,
    ): Promise<void> {
        const {
            hashedPassword,
            salt,
            passwordResetToken,
            passwordResetExpires,
        } = updatePasswordDto;

        const normalizedId =
            typeof id === 'string' ? new Types.ObjectId(id) : id;
        const user = await this.userRepository.findOneById(normalizedId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        // Update password
        await this.userRepository.updateOneById(normalizedId, {
            password: hashedPassword,
            salt,
            passwordResetToken,
            passwordResetExpires,
        });
    }

    async remove(id: string | Types.ObjectId): Promise<void> {
        const normalizedId =
            typeof id === 'string' ? new Types.ObjectId(id) : id;
        const user = await this.userRepository.updateOneById(normalizedId, {
            isActive: false,
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }
    }

    async updateLastLogin(id: string | Types.ObjectId): Promise<void> {
        const normalizedId =
            typeof id === 'string' ? new Types.ObjectId(id) : id;
        await this.userRepository.updateLastLogin(normalizedId);
    }

    toResponseDto(user: UserDocument): UserResponseDto {
        const {
            password,
            salt,
            emailVerificationToken,
            passwordResetToken,
            passwordResetExpires,
            ...userData
        } = user.toObject();
        return userData as UserResponseDto;
    }
}
