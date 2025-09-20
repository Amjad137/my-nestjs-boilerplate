import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from '@common/database/decorators/database.decorator';
import { IBaseEntity } from '@common/database/interfaces/database.interface';
import { BaseEntity } from '@common/database/bases/base.entity';
import { UserEntity } from '@modules/user/repository/entities/user.entity';
import { Types } from 'mongoose';

export const PostTableName = 'Posts';

export enum ENUM_POST_STATUS {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

@DatabaseEntity({ collection: PostTableName })
export class PostEntity extends BaseEntity {
    @DatabaseProp({
        required: true,
        unique: true,
        index: true,
        trim: true,
        type: String,
        maxlength: 250,
    })
    slug: string;

    @DatabaseProp({
        required: true,
        type: String,
    })
    content: string;

    @DatabaseProp({
        required: false,
        type: String,
    })
    featuredImage?: string;

    @DatabaseProp({
        required: true,
        ref: UserEntity.name,
        index: true,
        type: Types.ObjectId,
    })
    author: Types.ObjectId;

    @DatabaseProp({
        required: true,
        type: String,
        enum: ENUM_POST_STATUS,
        default: ENUM_POST_STATUS.DRAFT,
        index: true,
    })
    status: ENUM_POST_STATUS;

    @DatabaseProp({
        required: false,
        type: Date,
        index: true,
    })
    publishedAt?: Date;

    @DatabaseProp({
        required: false,
        type: [String],
        default: [],
    })
    tags?: string[];

    @DatabaseProp({
        required: true,
        default: true,
        type: Boolean,
    })
    allowComments: boolean;

    @DatabaseProp({
        required: false,
        trim: true,
        type: String,
        maxlength: 160,
    })
    metaDescription?: string;

    @DatabaseProp({
        required: false,
        type: [String],
        default: [],
    })
    metaKeywords?: string[];

    @DatabaseProp({
        required: true,
        default: 0,
        type: Number,
    })
    viewCount: number;

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
    commentCount: number;
}

export const PostSchema = DatabaseSchema(PostEntity);
export type PostDocument = PostEntity & IBaseEntity;
