import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { ENUM_USER_ROLE } from '@modules/user/dtos/user.dto';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<
            ENUM_USER_ROLE[]
        >(ROLES_KEY, [context.getHandler(), context.getClass()]);

        if (!requiredRoles) {
            return true; // No specific roles required
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            return false; // No user authenticated
        }

        // Check if user has the required role using the role field from User entity
        return requiredRoles.some(role => user.role === role);
    }
}
