import { registerAs } from '@nestjs/config';
import ms from 'ms';

export default registerAs('auth', () => ({
    jwt: {
        secret: process.env.JWT_SECRET || 'secret-jwt-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    },
    bcrypt: {
        saltRounds: 12,
    },
    cookieOptions: {
        httpOnly: true,
        secure: true,
        sameSite: 'none', // Allow cross-origin cookies
        maxAge: ms('30d'), // 30 days in milliseconds
        path: '/',
    },
    refreshTokenCookieKey: 'refresh_token',
    refreshTokenExpiresIn: 30,
}));
