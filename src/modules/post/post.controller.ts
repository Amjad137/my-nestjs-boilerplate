import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto, PostResponseDto } from './dtos/post.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Public } from '@common/decorators/public.decorator';
import { Roles, Role } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@common/database/dtos/pagination.dto';
import { IPaginationResult } from '@common/database/interfaces/database.interface';
import { Types } from 'mongoose';
import { PostDocument } from './repository/entities/post.entity';
import { AuthenticatedUser } from '@modules/auth/interfaces/auth.interface';

@ApiTags('Posts')
@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards globally to this controller
export class PostController {
    constructor(private readonly postService: PostService) {}

    // PUBLIC ROUTES
    @Public()
    @Get('published')
    @ApiOperation({ summary: 'Get published posts (public)' })
    @ApiResponse({
        status: 200,
        description: 'List of published posts',
        type: [PostResponseDto],
    })
    async findPublished(
        @Query() query?: PaginationQueryDto,
    ): Promise<PostDocument[] | IPaginationResult<PostDocument>> {
        return this.postService.findPublished(query);
    }

    @Public()
    @Get('by-slug/:slug')
    @ApiOperation({ summary: 'Get post by slug (public)' })
    @ApiResponse({
        status: 200,
        description: 'Post found',
        type: PostResponseDto,
    })
    @ApiParam({ name: 'slug', description: 'Post slug' })
    async findBySlug(@Param('slug') slug: string): Promise<PostDocument> {
        return this.postService.findBySlug(slug);
    }

    // USER ROUTES (requires authentication)
    @Get('my-posts')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user posts' })
    @ApiResponse({
        status: 200,
        description: 'User posts',
        type: [PostResponseDto],
    })
    async findMyPosts(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query?: PaginationQueryDto,
    ): Promise<PostDocument[] | IPaginationResult<PostDocument>> {
        return this.postService.findByAuthor(
            new Types.ObjectId(user._id),
            query,
        );
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new post (authenticated users)' })
    @ApiResponse({
        status: 201,
        description: 'Post created successfully',
        type: PostResponseDto,
    })
    async create(
        @Body() createPostDto: CreatePostDto,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<PostDocument> {
        return this.postService.create(
            createPostDto,
            new Types.ObjectId(user._id),
        );
    }

    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update post (author or admin)' })
    @ApiResponse({
        status: 200,
        description: 'Post updated successfully',
        type: PostResponseDto,
    })
    async update(
        @Param('id') id: string,
        @Body() updatePostDto: UpdatePostDto,
    ): Promise<PostDocument> {
        return this.postService.update(new Types.ObjectId(id), updatePostDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete post (author or admin)' })
    @ApiResponse({
        status: 200,
        description: 'Post deleted successfully',
    })
    async removeSelf(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<void> {
        return this.postService.removeIfAuthorized(
            new Types.ObjectId(id),
            new Types.ObjectId(user._id),
            user.role,
        );
    }

    // ADMIN ONLY ROUTES
    @Roles(Role.ADMIN) // Only admins can access
    @Get('admin/all')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all posts (admin only)' })
    @ApiResponse({
        status: 200,
        description: 'All posts with pagination',
        type: [PostResponseDto],
    })
    async findAllAdmin(
        @Query() query: PaginationQueryDto,
    ): Promise<IPaginationResult<PostDocument>> {
        return this.postService.findAll(query) as Promise<
            IPaginationResult<PostDocument>
        >;
    }

    @Roles(Role.ADMIN)
    @Put('admin/:id/publish')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Publish post (admin only)' })
    @ApiResponse({
        status: 200,
        description: 'Post published successfully',
        type: PostResponseDto,
    })
    async publish(@Param('id') id: string): Promise<PostDocument> {
        return this.postService.publish(new Types.ObjectId(id));
    }

    @Roles(Role.ADMIN)
    @Put('admin/:id/unpublish')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unpublish post (admin only)' })
    @ApiResponse({
        status: 200,
        description: 'Post unpublished successfully',
        type: PostResponseDto,
    })
    async unpublish(@Param('id') id: string): Promise<PostDocument> {
        return this.postService.unpublish(new Types.ObjectId(id));
    }

    @Roles(Role.ADMIN)
    @Delete('admin/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete post (admin only)' })
    @ApiResponse({
        status: 200,
        description: 'Post deleted successfully',
    })
    async remove(@Param('id') id: string): Promise<void> {
        return this.postService.remove(new Types.ObjectId(id));
    }
}
