import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { ENUM_LIKE_TYPE } from '../entities/like.entity';

export class LikePostDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'MongoDB ObjectId of the post to like',
        format: 'ObjectId',
    })
    @IsString()
    @IsNotEmpty()
    @IsMongoId({ message: 'postId must be a valid MongoDB ObjectId' })
    postId: string;
}

export class LikeCommentDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'MongoDB ObjectId of the comment to like',
        format: 'ObjectId',
    })
    @IsString()
    @IsNotEmpty()
    @IsMongoId({ message: 'commentId must be a valid MongoDB ObjectId' })
    commentId: string;
}

export class UnlikePostDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'MongoDB ObjectId of the post to unlike',
        format: 'ObjectId',
    })
    @IsString()
    @IsNotEmpty()
    @IsMongoId({ message: 'postId must be a valid MongoDB ObjectId' })
    postId: string;
}

export class UnlikeCommentDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'MongoDB ObjectId of the comment to unlike',
        format: 'ObjectId',
    })
    @IsString()
    @IsNotEmpty()
    @IsMongoId({ message: 'commentId must be a valid MongoDB ObjectId' })
    commentId: string;
}

export class LikeResponseDto {
    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'Unique identifier of the like',
        format: 'ObjectId',
    })
    _id: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID of the user who created the like',
        format: 'ObjectId',
    })
    user: string;

    @ApiProperty({
        example: 'POST',
        enum: ENUM_LIKE_TYPE,
        description: 'Type of entity being liked (POST or COMMENT)',
    })
    likeType: ENUM_LIKE_TYPE;

    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'ID of the target entity (post or comment) being liked',
        format: 'ObjectId',
    })
    targetId: string;

    @ApiProperty({
        example: '2024-01-01T00:00:00.000Z',
        description: 'Timestamp when the like was created',
        format: 'date-time',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2024-01-01T00:00:00.000Z',
        description: 'Timestamp when the like was last updated',
        format: 'date-time',
    })
    updatedAt: Date;
}

export class LikeCountResponseDto {
    @ApiProperty({
        example: 42,
        description: 'Total number of likes for the entity',
        minimum: 0,
    })
    count: number;

    @ApiProperty({
        example: true,
        description: 'Whether the current user has liked this entity',
    })
    isLiked: boolean;
}
