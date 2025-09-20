import {
    Controller,
    Post,
    Get,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '@modules/auth/auth.service';
import { AuthenticatedUser } from '@modules/auth/interfaces/auth.interface';
import {
    LoginDto,
    AuthResponseDto,
    RegisterDto,
} from '@modules/auth/dtos/auth.dto';
import {
    ChangePasswordDto,
    PasswordResetResponseDto,
    ForgotPasswordDto,
    ResetPasswordDto,
} from '@modules/auth/dtos/password-reset.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards globally to this controller
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    /*-----------------------------Login---------------------------------*/
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({
        status: 200,
        description: 'User logged in successfully',
        type: AuthResponseDto,
    })
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        return this.authService.login(loginDto, userAgent, res);
    }

    /*-----------------------------Signup / Register---------------------------------*/
    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'User register' })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: AuthResponseDto,
    })
    async register(
        @Body() registerDto: RegisterDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        return this.authService.register(registerDto, userAgent, res);
    }

    /*-----------------------------Refresh Token---------------------------------*/
    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User refresh token' })
    @ApiResponse({
        status: 200,
        description: 'User refresh token successfully',
        type: AuthResponseDto,
    })
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<AuthResponseDto> {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const cookieKey = this.configService.get('auth.refreshTokenCookieKey');
        const refreshToken = req.cookies?.[cookieKey];
        console.log(
            '🚀 ~ AuthController ~ refresh ~ refreshToken:',
            refreshToken,
        );

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        return this.authService.refreshToken(refreshToken, userAgent, res);
    }

    /*-----------------------------Get Own Profile---------------------------------*/
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
    })
    async getProfile(@CurrentUser() user: AuthenticatedUser) {
        return user;
    }

    /*-----------------------------Logout---------------------------------*/
    @Public()
    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({
        status: 200,
        description: 'Logout successful',
    })
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ message: string }> {
        const cookieKey = this.configService.get('auth.refreshTokenCookieKey');
        const refreshToken = req.cookies?.[cookieKey];
        if (refreshToken) {
            await this.authService.logout(refreshToken, res);
        } else {
            // Clear cookie even if no refresh token found
            const cookieOptions = this.configService.get('auth.cookieOptions');
            res.cookie(cookieKey, '', {
                ...cookieOptions,
                maxAge: 0,
            });
        }

        return {
            message: 'Logout successful',
        };
    }

    /*-----------------------------Change Password---------------------------------*/
    @Post('change-password')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change user password' })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        type: PasswordResetResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Current password is incorrect',
    })
    async changePassword(
        @Body() changePasswordDto: ChangePasswordDto,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<PasswordResetResponseDto> {
        return this.authService.changePassword(user._id, changePasswordDto);
    }

    /*-----------------------------Forgot Password---------------------------------*/
    @Public()
    @Post('forgot-password')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiResponse({
        status: 200,
        description: 'Password reset request processed',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example:
                        'If the email exists, a password reset link has been sent',
                },
                resetUrl: {
                    type: 'string',
                    example:
                        '(Dev mode only) http://localhost:3000/reset-password?token=1234567890',
                },
            },
        },
    })
    async forgotPassword(
        @Body() forgotPasswordDto: ForgotPasswordDto,
    ): Promise<{ message: string; resetUrl?: string }> {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    /*-----------------------------Reset Password---------------------------------*/
    @Public()
    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password with token' })
    @ApiResponse({
        status: 200,
        description: 'Password reset successfully',
        type: PasswordResetResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid or expired reset token',
    })
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<PasswordResetResponseDto> {
        return this.authService.resetPassword(resetPasswordDto);
    }
}
