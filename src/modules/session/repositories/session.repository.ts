import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '@common/database/bases/base.repository';
import { InjectDatabaseModel } from '@common/database/decorators/database.decorator';
import {
    SessionDocument,
    SessionEntity,
} from '@modules/session/entities/session.entity';
import { IPaginationResult } from '@common/database/interfaces/database.interface';

@Injectable()
export class SessionRepository extends BaseRepository<
    SessionEntity,
    SessionDocument
> {
    constructor(
        @InjectDatabaseModel(SessionEntity.name)
        private readonly sessionModel: Model<SessionEntity>,
    ) {
        super(sessionModel);
    }

    async findByRefreshToken(
        refreshToken: string,
    ): Promise<SessionDocument | null> {
        return this.findOne({ refreshToken });
    }

    async findByUserId(
        userId: string | Types.ObjectId,
    ): Promise<SessionDocument[] | IPaginationResult<SessionDocument>> {
        return this.findAll({ userId });
    }

    async deleteByRefreshToken(refreshToken: string): Promise<void> {
        await this.delete({ refreshToken });
    }

    async deleteByUserId(userId: string | Types.ObjectId): Promise<void> {
        await this.deleteMany({ userId });
    }

    async deleteExpiredSessions(): Promise<void> {
        await this.deleteMany({ expiresAt: { $lt: new Date() } });
    }
}
