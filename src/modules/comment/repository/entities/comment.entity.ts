import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from '@common/database/decorators/database.decorator';
import { IBaseEntity } from '@common/database/interfaces/database.interface';
import { BaseEntity } from '@common/database/bases/base.entity';
import { UserEntity } from '@modules/user/repository/entities/user.entity';
import { PostEntity } from '@modules/post/repository/entities/post.entity';
import { Types } from 'mongoose';

export const CommentTableName = 'Comments';

export enum ENUM_COMMENT_STATUS {
    ACTIVE = 'ACTIVE',
    SPAM = 'SPAM',
}

@DatabaseEntity({ collection: CommentTableName })
export class CommentEntity extends BaseEntity {
    @DatabaseProp({
        required: true,
        type: String,
        maxlength: 2000,
    })
    content: string;

    @DatabaseProp({
        required: true,
        ref: UserEntity.name,
        index: true,
        type: Types.ObjectId,
    })
    author: Types.ObjectId;

    @DatabaseProp({
        required: true,
        ref: PostEntity.name,
        index: true,
        type: Types.ObjectId,
    })
    post: Types.ObjectId;

    @DatabaseProp({
        required: false,
        ref: CommentEntity.name,
        type: Types.ObjectId,
        index: true,
    })
    parent?: Types.ObjectId;

    @DatabaseProp({
        required: true,
        type: String,
        enum: ENUM_COMMENT_STATUS,
        default: ENUM_COMMENT_STATUS.ACTIVE,
        index: true,
    })
    status: ENUM_COMMENT_STATUS;

    @DatabaseProp({
        required: true,
        default: 0,
        type: Number,
    })
    likeCount: number;

    @DatabaseProp({
        required: true,
        default: 0,
        type: Number,
    })
    replyCount: number;
}

export const CommentSchema = DatabaseSchema(CommentEntity);
export type CommentDocument = CommentEntity & IBaseEntity;
