import { Injectable } from '@nestjs/common';
import { Model, PopulateOptions, Types } from 'mongoose';
import { BaseRepository } from '@common/database/bases/base.repository';
import { InjectDatabaseModel } from '@common/database/decorators/database.decorator';
import {
    CommentDocument,
    CommentEntity,
    ENUM_COMMENT_STATUS,
} from '@modules/comment/repository/entities/comment.entity';
import { UserEntity } from '@modules/user/repository/entities/user.entity';
import { PostEntity } from '@modules/post/repository/entities/post.entity';
import { IPaginationResult } from '@common/database/interfaces/database.interface';

@Injectable()
export class CommentRepository extends BaseRepository<
    CommentEntity,
    CommentDocument
> {
    static readonly _joinWithAuthor: PopulateOptions[] = [
        {
            path: 'author',
            model: UserEntity.name,
            select: 'firstName lastName avatar',
        },
    ];

    static readonly _joinWithPost: PopulateOptions[] = [
        {
            path: 'post',
            model: PostEntity.name,
            select: 'title slug',
        },
    ];

    static readonly _joinWithParent: PopulateOptions[] = [
        {
            path: 'parent',
            model: CommentEntity.name,
            select: 'content author createdAt',
            populate: {
                path: 'author',
                model: UserEntity.name,
                select: 'firstName lastName avatar',
            },
        },
    ];

    static readonly _joinAll: PopulateOptions[] = [
        ...CommentRepository._joinWithAuthor,
        ...CommentRepository._joinWithPost,
        ...CommentRepository._joinWithParent,
    ];

    constructor(
        @InjectDatabaseModel(CommentEntity.name)
        private readonly commentModel: Model<CommentEntity>,
    ) {
        super(commentModel, CommentRepository._joinAll);
    }

    async findByPost(
        postId: string | Types.ObjectId,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.findAll(
            {
                post: postId,
                status: ENUM_COMMENT_STATUS.ACTIVE,
            },
            {
                join: true,
                order: { createdAt: -1 },
            },
        );
    }

    async findRootCommentsByPost(
        postId: string | Types.ObjectId,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.findAll(
            {
                post: postId,
                parent: { $exists: false },
                status: ENUM_COMMENT_STATUS.ACTIVE,
            },
            {
                join: true,
                order: { createdAt: -1 },
            },
        );
    }

    async findRepliesByParent(
        parentId: string | Types.ObjectId,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.findAll(
            {
                parent: parentId,
                status: ENUM_COMMENT_STATUS.ACTIVE,
            },
            {
                join: true,
                order: { createdAt: 1 },
            },
        );
    }

    async findByAuthor(
        authorId: string | Types.ObjectId,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.findAll(
            { author: authorId },
            {
                join: true,
                order: { createdAt: -1 },
            },
        );
    }

    async findSpamComments(): Promise<
        CommentDocument[] | IPaginationResult<CommentDocument>
    > {
        return this.findAll(
            { status: ENUM_COMMENT_STATUS.SPAM },
            {
                join: true,
                order: { createdAt: -1 },
            },
        );
    }

    async findByParent(
        parentId: string | Types.ObjectId,
    ): Promise<CommentDocument[]> {
        return this.findAll(
            { parent: parentId, status: ENUM_COMMENT_STATUS.ACTIVE },
            { join: true, order: { createdAt: -1 } },
        ) as Promise<CommentDocument[]>;
    }

    async incrementLikeCount(_id: Types.ObjectId): Promise<CommentDocument> {
        return this.updateOneById(_id, {
            $inc: { likeCount: 1 },
        });
    }

    async decrementLikeCount(_id: Types.ObjectId): Promise<CommentDocument> {
        return this.updateOneById(_id, {
            $inc: { likeCount: -1 },
        });
    }

    async incrementReplyCount(_id: Types.ObjectId): Promise<CommentDocument> {
        return this.updateOneById(_id, {
            $inc: { replyCount: 1 },
        });
    }

    async decrementReplyCount(_id: Types.ObjectId): Promise<CommentDocument> {
        return this.updateOneById(_id, {
            $inc: { replyCount: -1 },
        });
    }

    async markAsSpam(_id: Types.ObjectId): Promise<CommentDocument> {
        return this.updateOneById(_id, {
            status: ENUM_COMMENT_STATUS.SPAM,
        });
    }
}
