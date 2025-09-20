import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
    PostDocument,
    ENUM_POST_STATUS,
} from '@modules/post/repository/entities/post.entity';
import { PostRepository } from '@modules/post/repository/repositories/post.repository';
import {
    IPaginationQuery,
    IPaginationResult,
} from '@common/database/interfaces/database.interface';
import { CreatePostDto, UpdatePostDto } from './dtos/post.dto';
import { ENUM_USER_ROLE } from '@modules/user/dtos/user.dto';

@Injectable()
export class PostService {
    constructor(private readonly postRepository: PostRepository) {}

    async findAll(
        query?: IPaginationQuery,
    ): Promise<PostDocument[] | IPaginationResult<PostDocument>> {
        if (query) {
            return this.postRepository.findAll(
                {},
                {
                    paginationQuery: query,
                    searchFields: ['content', 'slug', 'tags'],
                    availableSortFields: [
                        'publishedAt',
                        'createdAt',
                        'viewCount',
                    ],
                    defaultSortField: 'createdAt',
                    join: true,
                },
            );
        }
        return this.postRepository.findAll({}, { join: true });
    }

    async findPublished(
        query?: IPaginationQuery,
    ): Promise<PostDocument[] | IPaginationResult<PostDocument>> {
        if (query) {
            return this.postRepository.findAll(
                { status: 'PUBLISHED' },
                {
                    paginationQuery: query,
                    searchFields: ['content', 'slug', 'tags'],
                    defaultSortField: 'publishedAt',
                    join: true,
                },
            );
        }
        return this.postRepository.findPublishedPosts();
    }

    async findOne(id: Types.ObjectId): Promise<PostDocument> {
        const post = await this.postRepository.findOneById(id, { join: true });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }

    async findBySlug(slug: string): Promise<PostDocument> {
        const post = await this.postRepository.findBySlug(slug);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }

    async findByAuthor(
        authorId: Types.ObjectId,
        query?: IPaginationQuery,
    ): Promise<PostDocument[] | IPaginationResult<PostDocument>> {
        if (query) {
            return this.postRepository.findAll(
                { author: authorId },
                {
                    paginationQuery: query,
                    searchFields: ['content', 'slug', 'tags'],
                    defaultSortField: 'createdAt',
                    join: true,
                },
            );
        }
        return this.postRepository.findByAuthor(authorId);
    }

    async findByTag(
        tag: string,
    ): Promise<PostDocument[] | IPaginationResult<PostDocument>> {
        return this.postRepository.findByTag(tag);
    }

    async create(
        createPostDto: CreatePostDto,
        authorId: Types.ObjectId,
    ): Promise<PostDocument> {
        // Generate slug if missing and ensure uniqueness
        let slug = createPostDto.slug;
        if (!slug) {
            const base =
                createPostDto.content?.slice(0, 50) || new Date().toISOString();
            slug = base
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
        }
        const existingBySlug = await this.postRepository.findBySlug(slug);
        if (existingBySlug) {
            throw new ConflictException('Post with this slug already exists');
        }

        const post = await this.postRepository.create({
            ...createPostDto,
            slug,
            author: authorId,
            status: createPostDto.status || ENUM_POST_STATUS.DRAFT,
        } as Partial<PostDocument>);

        // Populate author and return clean data
        await post.populate('author', 'firstName lastName avatar');

        return {
            _id: post._id,
            slug: post.slug,
            content: post.content,
            featuredImage: post.featuredImage,
            status: post.status,
            viewCount: post.viewCount,
            likeCount: post.likeCount,
            commentCount: post.commentCount,
            tags: post.tags,
            allowComments: post.allowComments,
            metaKeywords: post.metaKeywords,
            publishedAt: post.publishedAt,
            author: post.author,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        } as PostDocument;
    }

    async update(
        id: Types.ObjectId,
        updatePostDto: UpdatePostDto,
    ): Promise<PostDocument> {
        // Handle featuredImage explicitly - if it's null, we need to unset it
        const updateData: Partial<PostDocument> = { ...updatePostDto };

        // If featuredImage is explicitly null, we need to unset it
        if (updatePostDto.featuredImage === null) {
            updateData.featuredImage = undefined;
            // Use $unset to remove the field from the document
            const post = await this.postRepository.updateOneById(id, {
                $unset: { featuredImage: 1 },
            } as any);
            if (!post) {
                throw new NotFoundException('Post not found');
            }
            return post;
        }

        const post = await this.postRepository.updateOneById(id, updateData);
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }

    async remove(id: Types.ObjectId): Promise<void> {
        const deleted = await this.postRepository.softDeleteOneById(id);
        if (!deleted) {
            throw new NotFoundException('Post not found');
        }
    }

    async removeIfAuthorized(
        id: Types.ObjectId,
        requesterId: Types.ObjectId,
        requesterRole: string,
    ): Promise<void> {
        const post = await this.postRepository.findOneById(id);
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const isAdmin = requesterRole === ENUM_USER_ROLE.ADMIN;
        const isOwner = post.author?.toString() === requesterId.toString();

        if (!isAdmin && !isOwner) {
            throw new ConflictException(
                'You are not allowed to delete this post',
            );
        }

        const deleted = await this.postRepository.softDeleteOneById(id);
        if (!deleted) {
            throw new NotFoundException('Post not found');
        }
    }

    async publish(id: Types.ObjectId): Promise<PostDocument> {
        return this.postRepository.publish(id);
    }

    async unpublish(id: Types.ObjectId): Promise<PostDocument> {
        return this.postRepository.unpublish(id);
    }

    async archive(id: Types.ObjectId): Promise<PostDocument> {
        return this.postRepository.archive(id);
    }

    async incrementViewCount(id: Types.ObjectId): Promise<PostDocument> {
        return this.postRepository.incrementViewCount(id);
    }
}
