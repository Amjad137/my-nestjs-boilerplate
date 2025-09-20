import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionService } from '@modules/session/session.service';
import { SessionRepository } from '@modules/session/repositories/session.repository';
import {
    SessionEntity,
    SessionSchema,
} from '@modules/session/entities/session.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SessionEntity.name, schema: SessionSchema },
        ]),
    ],
    providers: [SessionService, SessionRepository],
    exports: [SessionService],
})
export class SessionModule {}
