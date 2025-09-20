import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { CommentService } from '@modules/comment/comment.service';
import { CommentDocument } from '@modules/comment/repository/entities/comment.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Public } from '@common/decorators/public.decorator';
import { Types } from 'mongoose';
import { IPaginationResult } from '@common/database/interfaces/database.interface';
import { PaginationQueryDto } from '@common/database/dtos/pagination.dto';
import {
    CreateCommentDto,
    UpdateCommentDto,
    CommentResponseDto,
} from '@modules/comment/dtos/comment.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@modules/auth/interfaces/auth.interface';

@ApiTags('Comments')
@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards globally to this controller
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    // PUBLIC ROUTES (no authentication required)
    @Public()
    @Get('post/:postId')
    @ApiOperation({ summary: 'Get comments for a post (public)' })
    @ApiResponse({
        status: 200,
        description: 'List of approved comments for the post',
        type: [CommentResponseDto],
    })
    async findByPost(
        @Param('postId') postId: string,
        @Query() query?: PaginationQueryDto,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.commentService.findByPost(
            new Types.ObjectId(postId),
            query,
        );
    }

    @Get('post/:postId/root')
    @ApiOperation({ summary: 'Get root comments for a post (no parent)' })
    @ApiResponse({
        status: 200,
        description: 'List of root comments for the post',
        type: [CommentResponseDto],
    })
    async findRootCommentsByPost(
        @Param('postId') postId: string,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.commentService.findRootCommentsByPost(
            new Types.ObjectId(postId),
        );
    }

    @Get('parent/:parentId/replies')
    @ApiOperation({ summary: 'Get replies to a comment' })
    @ApiResponse({
        status: 200,
        description: 'List of replies to the comment',
        type: [CommentResponseDto],
    })
    async findRepliesByParent(
        @Param('parentId') parentId: string,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.commentService.findRepliesByParent(
            new Types.ObjectId(parentId),
        );
    }

    @Get('author/:authorId')
    @ApiOperation({ summary: 'Get comments by author' })
    @ApiResponse({
        status: 200,
        description: 'List of comments by author',
        type: [CommentResponseDto],
    })
    async findByAuthor(
        @Param('authorId') authorId: string,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.commentService.findByAuthor(new Types.ObjectId(authorId));
    }

    @Get('spam')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get spam comments for review' })
    @ApiResponse({
        status: 200,
        description: 'List of spam comments',
        type: [CommentResponseDto],
    })
    async findSpamComments(): Promise<CommentDocument[]> {
        return this.commentService.findSpamComments() as Promise<
            CommentDocument[]
        >;
    }

    @Get(':id/replies')
    @ApiOperation({ summary: 'Get replies for a comment' })
    @ApiResponse({
        status: 200,
        description: 'List of replies for the comment',
        type: [CommentResponseDto],
    })
    async findReplies(
        @Param('id') id: string,
        @Query() query: PaginationQueryDto,
    ): Promise<CommentDocument[] | IPaginationResult<CommentDocument>> {
        return this.commentService.findReplies(new Types.ObjectId(id), query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get comment by ID' })
    @ApiResponse({
        status: 200,
        description: 'Comment found',
        type: CommentResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Comment not found',
    })
    async findOne(@Param('id') id: string): Promise<CommentDocument> {
        return this.commentService.findOne(new Types.ObjectId(id));
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new comment' })
    @ApiResponse({
        status: 201,
        description: 'Comment created successfully (pending moderation)',
        type: CommentResponseDto,
    })
    async create(
        @Body() createCommentData: CreateCommentDto,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<CommentDocument> {
        return this.commentService.create(
            createCommentData,
            new Types.ObjectId(user._id),
        );
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update comment' })
    @ApiResponse({
        status: 200,
        description: 'Comment updated successfully',
        type: CommentResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Comment not found',
    })
    async update(
        @Param('id') id: string,
        @Body() updateCommentData: UpdateCommentDto,
    ): Promise<CommentDocument> {
        return this.commentService.update(
            new Types.ObjectId(id),
            updateCommentData,
        );
    }

    @Patch(':id/like')
    @ApiOperation({ summary: 'Like comment' })
    @ApiResponse({
        status: 200,
        description: 'Comment liked successfully',
        type: CommentResponseDto,
    })
    async like(@Param('id') id: string): Promise<CommentDocument> {
        return this.commentService.like(new Types.ObjectId(id));
    }

    @Patch(':id/unlike')
    @ApiOperation({ summary: 'Unlike comment' })
    @ApiResponse({
        status: 200,
        description: 'Comment unliked successfully',
        type: CommentResponseDto,
    })
    async unlike(@Param('id') id: string): Promise<CommentDocument> {
        return this.commentService.unlike(new Types.ObjectId(id));
    }

    @Patch(':id/spam')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark comment as spam' })
    @ApiResponse({
        status: 200,
        description: 'Comment marked as spam successfully',
        type: CommentResponseDto,
    })
    async markAsSpam(@Param('id') id: string): Promise<CommentDocument> {
        return this.commentService.markAsSpam(new Types.ObjectId(id));
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Soft delete comment' })
    @ApiResponse({
        status: 200,
        description: 'Comment deleted successfully',
    })
    @ApiResponse({
        status: 404,
        description: 'Comment not found',
    })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        await this.commentService.remove(new Types.ObjectId(id));
        return { message: 'Comment deleted successfully' };
    }
}
