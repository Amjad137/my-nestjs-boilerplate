import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { HealthModule } from '@modules/health/health.module';
import { SessionModule } from '@modules/session/session.module';
import { S3Module } from '@modules/s3/s3.module';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Module({
    controllers: [],
    providers: [
        // Apply JwtAuthGuard globally to all routes
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        // Apply RolesGuard globally (runs after JwtAuthGuard)
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
    imports: [AuthModule, UserModule, HealthModule, SessionModule, S3Module],
    exports: [AuthModule, UserModule, HealthModule, SessionModule, S3Module],
})
export class RouterModule {}
