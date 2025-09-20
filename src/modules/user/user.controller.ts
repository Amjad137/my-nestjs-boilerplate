import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    UseGuards,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from '@modules/user/user.service';
import { AuthenticatedUser } from '@modules/auth/interfaces/auth.interface';
import {
    CreateUserDto,
    UpdateUserDto,
    UserResponseDto,
} from '@modules/user/dtos/user.dto';
import { IPaginationResult } from '@common/database/interfaces/database.interface';
import { PaginationQueryDto } from '@common/database/dtos/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles, Role } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ChangePasswordDto } from '@modules/auth/dtos/password-reset.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards globally to this controller
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Patch('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({
        status: 200,
        description: 'Profile updated successfully',
        type: UserResponseDto,
    })
    async updateProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        return this.userService.update(user._id.toString(), updateUserDto);
    }

    @Patch('me/change-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change current user password' })
    @ApiResponse({ status: 204, description: 'Password changed successfully' })
    @ApiResponse({ status: 400, description: 'Current password is incorrect' })
    async changeMyPassword(
        @CurrentUser() user: AuthenticatedUser,
        @Body() changePasswordDto: ChangePasswordDto,
    ): Promise<void> {
        return this.userService.changePassword(
            user._id.toString(),
            changePasswordDto,
        );
    }

    // ADMIN ONLY ROUTES
    @Roles(Role.ADMIN)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new user (admin only)' })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 409,
        description: 'User with this email already exists',
    })
    async create(
        @Body() createUserDto: CreateUserDto,
    ): Promise<UserResponseDto> {
        return this.userService.create(createUserDto);
    }

    @Roles(Role.ADMIN)
    @Get('admin/all')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users with pagination (admin only)' })
    @ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/UserResponseDto' },
                },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                        totalPages: { type: 'number' },
                        hasNext: { type: 'boolean' },
                        hasPrev: { type: 'boolean' },
                    },
                },
            },
        },
    })
    async findAllAdmin(
        @Query() query: PaginationQueryDto,
    ): Promise<IPaginationResult<UserResponseDto>> {
        return this.userService.findAll(query);
    }

    @Roles(Role.ADMIN)
    @Get('admin/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user by ID (admin only)' })
    @ApiResponse({
        status: 200,
        description: 'User retrieved successfully',
        type: UserResponseDto,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findOneAdmin(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.findById(id);
    }

    @Roles(Role.ADMIN)
    @Patch('admin/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update any user (admin only)' })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
        type: UserResponseDto,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateAdmin(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        return this.userService.update(id, updateUserDto);
    }

    @Roles(Role.ADMIN)
    @Delete('admin/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete user (admin only)' })
    @ApiResponse({ status: 204, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async removeAdmin(@Param('id') id: string): Promise<void> {
        return this.userService.remove(id);
    }
}
