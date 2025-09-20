import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
    CommentDocument,
    ENUM_COMMENT_STATUS,
} from '@modules/comment/repository/entities/comment.entity';
import { CommentRepository } from '@modules/comment/repository/repositories/comment.repository';
import { PostRepository } from '@modules/post/repository/repositories/post.repository';
import {
    IPaginationQuery,
    IPaginationResult,
} from '@common/database/interfaces/database.interface';
import { CreateCommentDto } from '@modules/comment/dtos/comment.dto';

@Injectable()
export class CommentService {
    constructor(
        private readonly commentRepository: CommentRepository,
        private readonly postRepository: PostRepository,
    ) {}

    async findByPost(
        postId: Types.ObjectId,
        query?: IPaginationQuery,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        if (query) {
            return this.commentRepository.findAll(
                { post: postId, status: ENUM_COMMENT_STATUS.ACTIVE },
                {
                    paginationQuery: query,
                    searchFields: ['content'],
                    availableSortFields: ['createdAt'],
                    defaultSortField: 'createdAt',
                    join: true, // Include author and post
                },
            );
        }
        return this.commentRepository.findByPost(postId);
    }

    async findRootCommentsByPost(
        postId: Types.ObjectId,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.commentRepository.findRootCommentsByPost(postId);
    }

    async findRepliesByParent(
        parentId: Types.ObjectId,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.commentRepository.findRepliesByParent(parentId);
    }

    async findByAuthor(
        authorId: Types.ObjectId,
        query?: IPaginationQuery,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        if (query) {
            return this.commentRepository.findAll(
                { author: authorId, status: ENUM_COMMENT_STATUS.ACTIVE },
                {
                    paginationQuery: query,
                    searchFields: ['content'],
                    availableSortFields: ['createdAt'],
                    defaultSortField: 'createdAt',
                    join: true, // Include post
                },
            );
        }
        return this.commentRepository.findByAuthor(authorId);
    }

    async findSpamComments(
        query?: IPaginationQuery,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        if (query) {
            return this.commentRepository.findAll(
                { status: ENUM_COMMENT_STATUS.SPAM },
                {
                    paginationQuery: query,
                    searchFields: ['content'],
                    availableSortFields: ['createdAt'],
                    defaultSortField: 'createdAt',
                    join: true, // Include author and post
                },
            );
        }
        return this.commentRepository.findSpamComments();
    }

    async findOne(id: Types.ObjectId): Promise<CommentDocument> {
        const comment = await this.commentRepository.findOneById(id, {
            join: true,
        });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return comment;
    }

    async create(
        createCommentData: CreateCommentDto,
        authorId: Types.ObjectId,
    ): Promise<CommentDocument> {
        const commentData = {
            ...createCommentData,
            author: authorId,
            status: ENUM_COMMENT_STATUS.ACTIVE,
        };

        const comment = await this.commentRepository.create(commentData);

        // Increment post comment count
        await this.postRepository.incrementCommentCount(comment.post);

        // If this is a reply, increment parent's reply count
        if (comment.parent) {
            await this.commentRepository.incrementReplyCount(comment.parent);
        }

        // Populate the author field and return clean data
        await comment.populate('author', 'firstName lastName avatar');

        // Return only the necessary fields
        return {
            _id: comment._id,
            content: comment.content,
            author: comment.author,
            post: comment.post,
            parent: comment.parent,
            status: comment.status,
            likeCount: comment.likeCount,
            replyCount: comment.replyCount,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        } as CommentDocument;
    }

    async update(
        id: Types.ObjectId,
        updateCommentData: Partial<CommentDocument>,
    ): Promise<CommentDocument> {
        const comment = await this.commentRepository.updateOneById(
            id,
            updateCommentData,
        );
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return comment;
    }

    async remove(id: Types.ObjectId): Promise<void> {
        const comment = await this.commentRepository.findOneById(id);
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        // Decrement post comment count
        await this.postRepository.decrementCommentCount(comment.post);

        // If this is a reply, decrement parent's reply count
        if (comment.parent) {
            await this.commentRepository.decrementReplyCount(comment.parent);
        }

        await this.commentRepository.softDeleteOneById(id);
    }

    async like(id: Types.ObjectId): Promise<CommentDocument> {
        return this.commentRepository.incrementLikeCount(id);
    }

    async unlike(id: Types.ObjectId): Promise<CommentDocument> {
        return this.commentRepository.decrementLikeCount(id);
    }

    async markAsSpam(id: Types.ObjectId): Promise<CommentDocument> {
        return this.commentRepository.markAsSpam(id);
    }

    async findReplies(
        parentId: Types.ObjectId,
        query?: IPaginationQuery,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        if (query) {
            return this.commentRepository.findAll(
                { parent: parentId, status: ENUM_COMMENT_STATUS.ACTIVE },
                {
                    paginationQuery: query,
                    searchFields: ['content'],
                    availableSortFields: ['createdAt'],
                    defaultSortField: 'createdAt',
                    join: true, // Include author
                },
            );
        }
        return this.commentRepository.findByParent(parentId);
    }
}
