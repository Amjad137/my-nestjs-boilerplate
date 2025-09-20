import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { LikeRepository } from '@modules/like/repositories/like.repository';
import { PostRepository } from '@modules/post/repository/repositories/post.repository';
import {
    LikeDocument,
    ENUM_LIKE_TYPE,
} from '@modules/like/entities/like.entity';

@Injectable()
export class LikeService {
    constructor(
        private readonly likeRepository: LikeRepository,
        private readonly postRepository: PostRepository,
    ) {}

    async likePost(
        userId: string | Types.ObjectId,
        postId: string | Types.ObjectId,
    ): Promise<LikeDocument> {
        const existingLike = await this.likeRepository.findByUserAndTarget(
            userId,
            postId,
            ENUM_LIKE_TYPE.POST,
        );

        if (existingLike) {
            throw new ConflictException('Post already liked by user');
        }

        const uniqueKey = `${userId}_${postId}_${ENUM_LIKE_TYPE.POST}`;
        const like = await this.likeRepository.create({
            user: new Types.ObjectId(userId),
            likeType: ENUM_LIKE_TYPE.POST,
            targetId: new Types.ObjectId(postId),
            uniqueKey,
        });

        // Update post like count
        await this.postRepository.incrementLikeCount(
            new Types.ObjectId(postId),
        );

        return like;
    }

    async likeComment(
        userId: string | Types.ObjectId,
        commentId: string | Types.ObjectId,
    ): Promise<LikeDocument> {
        const existingLike = await this.likeRepository.findByUserAndTarget(
            userId,
            commentId,
            ENUM_LIKE_TYPE.COMMENT,
        );

        if (existingLike) {
            throw new ConflictException('Comment already liked by user');
        }

        const uniqueKey = `${userId}_${commentId}_${ENUM_LIKE_TYPE.COMMENT}`;
        return this.likeRepository.create({
            user: new Types.ObjectId(userId),
            likeType: ENUM_LIKE_TYPE.COMMENT,
            targetId: new Types.ObjectId(commentId),
            uniqueKey,
        });
    }

    async unlikePost(
        userId: string | Types.ObjectId,
        postId: string | Types.ObjectId,
    ): Promise<void> {
        const deleted = await this.likeRepository.deleteByUserAndTarget(
            userId,
            postId,
            ENUM_LIKE_TYPE.POST,
        );

        if (!deleted) {
            throw new NotFoundException('Like not found');
        }

        // Update post like count
        await this.postRepository.decrementLikeCount(
            new Types.ObjectId(postId),
        );
    }

    async unlikeComment(
        userId: string | Types.ObjectId,
        commentId: string | Types.ObjectId,
    ): Promise<void> {
        const deleted = await this.likeRepository.deleteByUserAndTarget(
            userId,
            commentId,
            ENUM_LIKE_TYPE.COMMENT,
        );

        if (!deleted) {
            throw new NotFoundException('Like not found');
        }
    }

    async getPostLikes(
        postId: string | Types.ObjectId,
    ): Promise<LikeDocument[]> {
        return this.likeRepository.findByTarget(postId, ENUM_LIKE_TYPE.POST);
    }

    async getCommentLikes(
        commentId: string | Types.ObjectId,
    ): Promise<LikeDocument[]> {
        return this.likeRepository.findByTarget(
            commentId,
            ENUM_LIKE_TYPE.COMMENT,
        );
    }

    async getPostLikeCount(postId: string | Types.ObjectId): Promise<number> {
        return this.likeRepository.countByTarget(postId, ENUM_LIKE_TYPE.POST);
    }

    async getCommentLikeCount(
        commentId: string | Types.ObjectId,
    ): Promise<number> {
        return this.likeRepository.countByTarget(
            commentId,
            ENUM_LIKE_TYPE.COMMENT,
        );
    }

    async getUserLikes(
        userId: string | Types.ObjectId,
        likeType?: ENUM_LIKE_TYPE,
    ): Promise<LikeDocument[]> {
        return this.likeRepository.findByUser(userId, likeType);
    }

    async isLikedByUser(
        userId: string | Types.ObjectId,
        targetId: string | Types.ObjectId,
        likeType: ENUM_LIKE_TYPE,
    ): Promise<boolean> {
        const like = await this.likeRepository.findByUserAndTarget(
            userId,
            targetId,
            likeType,
        );
        return !!like;
    }

    async deleteLikesByTarget(
        targetId: string | Types.ObjectId,
        likeType: ENUM_LIKE_TYPE,
    ): Promise<void> {
        await this.likeRepository.deleteByTarget(targetId, likeType);
    }
}
