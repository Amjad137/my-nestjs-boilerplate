import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from '@common/database/decorators/database.decorator';
import { IBaseEntity } from '@common/database/interfaces/database.interface';
import { BaseEntity } from '@common/database/bases/base.entity';
import { UserEntity } from '@modules/user/repository/entities/user.entity';
import { Types } from 'mongoose';

export const LikeTableName = 'Likes';

export enum ENUM_LIKE_TYPE {
    POST = 'POST',
    COMMENT = 'COMMENT',
}

@DatabaseEntity({ collection: LikeTableName })
export class LikeEntity extends BaseEntity {
    @DatabaseProp({
        required: true,
        ref: UserEntity.name,
        index: true,
        type: Types.ObjectId,
    })
    user: Types.ObjectId;

    @DatabaseProp({
        required: true,
        type: String,
        enum: ENUM_LIKE_TYPE,
        index: true,
    })
    likeType: ENUM_LIKE_TYPE;

    @DatabaseProp({
        required: true,
        index: true,
        type: Types.ObjectId,
    })
    targetId: Types.ObjectId;

    // Compound index for user + targetId + likeType to prevent duplicate likes
    @DatabaseProp({
        required: true,
        type: String,
        unique: true,
    })
    uniqueKey: string; // Format: "userId_targetId_likeType"
}

export const LikeSchema = DatabaseSchema(LikeEntity);
export type LikeDocument = LikeEntity & IBaseEntity;
