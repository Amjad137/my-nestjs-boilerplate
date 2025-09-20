import { BaseEntity } from '@common/database/bases/base.entity';
import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from '@common/database/decorators/database.decorator';
import { Types } from 'mongoose';
import { UserEntity } from '@modules/user/repository/entities/user.entity';
import { IBaseEntity } from '@common/database/interfaces/database.interface';

export const SessionTableName = 'Sessions';

@DatabaseEntity({ collection: SessionTableName })
export class SessionEntity extends BaseEntity {
    @DatabaseProp({
        required: true,
        ref: UserEntity.name,
        type: Types.ObjectId,
    })
    userId: Types.ObjectId;

    @DatabaseProp({
        required: true,
        type: String,
        unique: true,
        index: true,
    })
    refreshToken: string;

    @DatabaseProp({
        required: true,
        type: Date,
    })
    expiresAt: Date;

    @DatabaseProp({
        required: true,
        type: String,
    })
    userAgent: string;
}

export const SessionSchema = DatabaseSchema(SessionEntity);
export type SessionDocument = SessionEntity & IBaseEntity;
