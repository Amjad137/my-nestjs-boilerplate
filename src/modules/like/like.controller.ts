import {
    Controller,
    Post,
    Delete,
    Get,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { LikeService } from '@modules/like/like.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
    LikePostDto,
    LikeCommentDto,
    UnlikePostDto,
    UnlikeCommentDto,
    LikeResponseDto,
    LikeCountResponseDto,
} from '@modules/like/dtos/like.dto';
import {
    ENUM_LIKE_TYPE,
    LikeDocument,
} from '@modules/like/entities/like.entity';
import { AuthenticatedUser } from '@modules/auth/interfaces/auth.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Likes')
@Controller('likes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('accessToken')
export class LikeController {
    constructor(private readonly likeService: LikeService) {}

    @Post('post')
    @ApiOperation({ summary: 'Like a post' })
    @ApiResponse({
        status: 201,
        description: 'Post liked successfully',
        type: LikeResponseDto,
    })
    @ApiResponse({ status: 409, description: 'Post already liked' })
    @ApiBearerAuth()
    async likePost(
        @Body() likePostDto: LikePostDto,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<LikeDocument> {
        return await this.likeService.likePost(user._id, likePostDto.postId);
    }

    @Post('comment')
    @ApiOperation({ summary: 'Like a comment' })
    @ApiResponse({
        status: 201,
        description: 'Comment liked successfully',
        type: LikeResponseDto,
    })
    @ApiResponse({ status: 409, description: 'Comment already liked' })
    @ApiBearerAuth()
    async likeComment(
        @Body() likeCommentDto: LikeCommentDto,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<LikeDocument> {
        return await this.likeService.likeComment(
            user._id,
            likeCommentDto.commentId,
        );
    }

    @Delete('post')
    @ApiOperation({ summary: 'Unlike a post' })
    @ApiResponse({ status: 200, description: 'Post unliked successfully' })
    @ApiResponse({ status: 404, description: 'Like not found' })
    @ApiBearerAuth()
    async unlikePost(
        @Body() unlikePostDto: UnlikePostDto,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<void> {
        return this.likeService.unlikePost(user._id, unlikePostDto.postId);
    }

    @Delete('comment')
    @ApiOperation({ summary: 'Unlike a comment' })
    @ApiResponse({ status: 200, description: 'Comment unliked successfully' })
    @ApiResponse({ status: 404, description: 'Like not found' })
    @ApiBearerAuth()
    async unlikeComment(
        @Body() unlikeCommentDto: UnlikeCommentDto,
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<void> {
        return this.likeService.unlikeComment(
            user._id,
            unlikeCommentDto.commentId,
        );
    }

    @Get('post/:postId')
    @ApiOperation({ summary: 'Get post likes' })
    @ApiResponse({
        status: 200,
        description: 'Post likes retrieved successfully',
        type: [LikeResponseDto],
    })
    async getPostLikes(
        @Param('postId') postId: string,
    ): Promise<LikeResponseDto[]> {
        const likes = await this.likeService.getPostLikes(postId);
        return likes.map(like => ({
            _id: like._id.toString(),
            user: like.user.toString(),
            likeType: like.likeType,
            targetId: like.targetId.toString(),
            createdAt: like.createdAt,
            updatedAt: like.updatedAt,
        }));
    }

    @Get('comment/:commentId')
    @ApiOperation({ summary: 'Get comment likes' })
    @ApiResponse({
        status: 200,
        description: 'Comment likes retrieved successfully',
        type: [LikeResponseDto],
    })
    async getCommentLikes(
        @Param('commentId') commentId: string,
    ): Promise<LikeResponseDto[]> {
        const likes = await this.likeService.getCommentLikes(commentId);
        return likes.map(like => ({
            _id: like._id.toString(),
            user: like.user.toString(),
            likeType: like.likeType,
            targetId: like.targetId.toString(),
            createdAt: like.createdAt,
            updatedAt: like.updatedAt,
        }));
    }

    @Get('post/:postId/count')
    @ApiOperation({ summary: 'Get post like count' })
    @ApiResponse({
        status: 200,
        description: 'Post like count retrieved successfully',
        type: LikeCountResponseDto,
    })
    async getPostLikeCount(
        @Param('postId') postId: string,
        @Request() req: any,
    ): Promise<LikeCountResponseDto> {
        const userId = req.user._id;
        const [count, isLiked] = await Promise.all([
            this.likeService.getPostLikeCount(postId),
            this.likeService.isLikedByUser(userId, postId, ENUM_LIKE_TYPE.POST),
        ]);

        return { count, isLiked };
    }

    @Get('comment/:commentId/count')
    @ApiOperation({ summary: 'Get comment like count' })
    @ApiResponse({
        status: 200,
        description: 'Comment like count retrieved successfully',
        type: LikeCountResponseDto,
    })
    async getCommentLikeCount(
        @Param('commentId') commentId: string,
        @Request() req: any,
    ): Promise<LikeCountResponseDto> {
        const userId = req.user._id;
        const [count, isLiked] = await Promise.all([
            this.likeService.getCommentLikeCount(commentId),
            this.likeService.isLikedByUser(
                userId,
                commentId,
                ENUM_LIKE_TYPE.COMMENT,
            ),
        ]);

        return { count, isLiked };
    }

    @Get('user')
    @ApiOperation({ summary: 'Get user likes' })
    @ApiResponse({
        status: 200,
        description: 'User likes retrieved successfully',
        type: [LikeResponseDto],
    })
    async getUserLikes(@Request() req: any): Promise<LikeResponseDto[]> {
        const userId = req.user._id;
        const likes = await this.likeService.getUserLikes(userId);
        return likes.map(like => ({
            _id: like._id.toString(),
            user: like.user.toString(),
            likeType: like.likeType,
            targetId: like.targetId.toString(),
            createdAt: like.createdAt,
            updatedAt: like.updatedAt,
        }));
    }
}
