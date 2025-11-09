import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { Document } from 'mongoose';
import { UserService } from '@modules/user/user.service';
import { SessionService } from '@modules/session/session.service';
import { LoginDto, AuthResponseDto } from '@modules/auth/dtos/auth.dto';
import { JwtPayload } from '@modules/auth/interfaces/auth.interface';
import { CreateUserDto } from '@modules/user/dtos/user.dto';
import {
    ChangePasswordDto,
    ForgotPasswordDto,
    ResetPasswordDto,
} from '@modules/auth/dtos/password-reset.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
    ) {}

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        const cookieOptions = this.configService.get('auth.cookieOptions');
        const cookieKey = this.configService.get('auth.refreshTokenCookieKey');

        // When sameSite is 'none', secure must be true
        const setOptions = {
            ...cookieOptions,
            secure:
                cookieOptions.sameSite === 'none' ? true : cookieOptions.secure,
        };

        res.cookie(cookieKey, refreshToken, setOptions);
    }

    private clearRefreshTokenCookie(res: Response) {
        const cookieKey = this.configService.get('auth.refreshTokenCookieKey');
        const cookieOptions = this.configService.get('auth.cookieOptions');

        // When sameSite is 'none', secure must be true
        const clearOptions = {
            httpOnly: cookieOptions.httpOnly,
            secure:
                cookieOptions.sameSite === 'none' ? true : cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
            path: cookieOptions.path,
            maxAge: 0,
            expires: new Date(0), // Set to epoch time
        };

        res.cookie(cookieKey, '', clearOptions);
    }

    async login(
        loginDto: LoginDto,
        userAgent: string,
        res: Response,
    ): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        // Find user by email
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        await this.userService.updateLastLogin(user._id.toString());

        // Create session with refresh token
        const session = await this.sessionService.createSession(
            user._id,
            userAgent,
        );
        // Generate JWT token bound to session
        const payload: JwtPayload = {
            email: user.email,
            sub: user._id.toString(),
            sid: session._id.toString(),
        };
        const accessToken = this.jwtService.sign(payload);
        this.setRefreshTokenCookie(res, session.refreshToken);
        console.log(
            '🚀 ~ AuthService ~ login ~ session.refreshToken:',
            session.refreshToken,
        );
        return {
            accessToken,
            user: this.userService.toResponseDto(user),
        };
    }

    async register(
        registerDto: CreateUserDto,
        userAgent: string,
        res: Response,
    ): Promise<AuthResponseDto> {
        const { email, phoneNumber, password, firstName, lastName, address } =
            registerDto;

        // Check if user already exists
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Check if phone number already exists
        const existingPhone =
            await this.userService.findByPhoneNumber(phoneNumber);
        if (existingPhone) {
            throw new ConflictException(
                'User with this phone number already exists',
            );
        }

        // Create user
        const user = await this.userService.create({
            email,
            phoneNumber,
            password,
            firstName,
            lastName,
            address,
        });

        // Create session with refresh token
        const session = await this.sessionService.createSession(
            user._id,
            userAgent,
        );
        // Generate JWT token bound to session
        const payload: JwtPayload = {
            email: user.email,
            sub: user._id.toString(),
            sid: session._id.toString(),
        };
        const accessToken = this.jwtService.sign(payload);

        // Set refresh token in cookie
        this.setRefreshTokenCookie(res, session.refreshToken);

        return {
            accessToken,
            user,
        };
    }

    async refreshToken(
        refreshToken: string,
        userAgent: string,
        res: Response,
    ): Promise<AuthResponseDto> {
        // Validate refresh token
        const session =
            await this.sessionService.validateRefreshToken(refreshToken);

        // Get user
        const user = await this.userService.findById(session.userId.toString());
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Revoke old session
        await this.sessionService.revokeSession(refreshToken);

        // Create new session
        const newSession = await this.sessionService.createSession(
            user._id,
            userAgent,
        );

        // Set new refresh token in cookie
        this.setRefreshTokenCookie(res, newSession.refreshToken);

        // Generate new JWT token bound to the new session
        const payload: JwtPayload = {
            email: user.email,
            sub: user._id.toString(),
            sid: newSession._id.toString(),
        };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user,
        };
    }

    async logout(refreshToken: string, res: Response): Promise<void> {
        await this.sessionService.revokeSession(refreshToken);

        // Clear refresh token cookie
        this.clearRefreshTokenCookie(res);
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            const userObj = user instanceof Document ? user.toObject() : user;
            const { password: _, ...result } = userObj;
            return result;
        }
        return null;
    }

    async changePassword(
        userId: string,
        changePasswordDto: ChangePasswordDto,
    ): Promise<{ message: string; timestamp: string }> {
        await this.userService.changePassword(userId, changePasswordDto);

        return {
            message: 'Password changed successfully',
            timestamp: new Date().toISOString(),
        };
    }

    async forgotPassword(
        forgotPasswordDto: ForgotPasswordDto,
    ): Promise<{ message: string; resetUrl?: string }> {
        const { email } = forgotPasswordDto;

        // Find user by email
        const user = await this.userService.findByEmail(email);
        if (!user) {
            return {
                message:
                    'If the email exists, a password reset link has been sent',
            };
        }

        // Generate reset token
        const resetToken = await bcrypt.genSalt(32);
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Update user with reset token and expiry
        await this.userService.update(user._id.toString(), {
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
        });

        // TODO: Send email with reset link
        // For now, we'll just log the token (in production, send email)
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(
            `Reset link: http://localhost:3000/reset-password?token=${resetToken}`,
        );
        return {
            message: 'If the email exists, a password reset link has been sent',
            resetUrl: `http://localhost:3000/reset-password?token=${resetToken}`,
        };
    }

    async resetPassword(
        resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string; timestamp: string }> {
        const { token, newPassword } = resetPasswordDto;

        // Find user by reset token
        const user = await this.userService.findByPasswordResetToken(token);
        if (!user) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        // Check if token is expired
        if (
            user.passwordResetExpires &&
            user.passwordResetExpires < new Date()
        ) {
            throw new UnauthorizedException('Reset token has expired');
        }

        // Generate new salt and hash new password
        const newSalt = await bcrypt.genSalt(
            this.configService.get<number>('auth.bcrypt.saltRounds'),
        );
        const newHashedPassword = await bcrypt.hash(newPassword, newSalt);

        // Update user with new password and clear reset token
        await this.userService.updatePassword(user._id.toString(), {
            hashedPassword: newHashedPassword,
            salt: newSalt,
            passwordResetToken: undefined,
            passwordResetExpires: undefined,
        });

        return {
            message: 'Password reset successfully',
            timestamp: new Date().toISOString(),
        };
    }
}
