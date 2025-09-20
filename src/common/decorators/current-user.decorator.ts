import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from '@modules/auth/interfaces/auth.interface';

export const CurrentUser = createParamDecorator(
    (
        data: keyof AuthenticatedUser | undefined,
        ctx: ExecutionContext,
    ): AuthenticatedUser | string | boolean | Date => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as AuthenticatedUser | undefined;

        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }

        // If a specific property is requested, return only that property
        if (data && typeof data === 'string') {
            return user[data];
        }

        // Otherwise return the full user object
        return user;
    },
);
