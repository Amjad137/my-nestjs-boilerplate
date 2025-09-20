import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@modules/user/user.service';
import { JwtPayload } from '@modules/auth/interfaces/auth.interface';
import { SessionService } from '@modules/session/session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly sessionService: SessionService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('auth.jwt.secret'),
        });
    }

    async validate(payload: JwtPayload) {
        // Ensure the session tied to this JWT is still active
        await this.sessionService.assertActiveSessionById(payload.sid);
        const user = await this.userService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
