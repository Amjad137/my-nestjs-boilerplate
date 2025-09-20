import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '@modules/auth/auth.service';
import { AuthController } from '@modules/auth/auth.controller';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { UserModule } from '@modules/user/user.module';
import { SessionModule } from '@modules/session/session.module';

@Module({
    imports: [
        UserModule,
        SessionModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('auth.jwt.secret'),
                signOptions: {
                    expiresIn: configService.get<string>('auth.jwt.expiresIn'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
