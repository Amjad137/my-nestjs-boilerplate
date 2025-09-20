import { IsString, IsOptional, IsEnum } from 'class-validator';
import {
    ApiProperty,
    ApiPropertyOptional,
    OmitType,
    PartialType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export enum ENUM_COMMENT_STATUS {
    ACTIVE = 'ACTIVE',
    SPAM = 'SPAM',
}

export class CreateCommentDto {
    @ApiProperty({ example: 'This is a great post!' })
    @IsString()
    content: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    @Transform(({ value }: { value: string }) => new Types.ObjectId(value))
    post: Types.ObjectId;

    @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
    @IsOptional()
    @Transform(({ value }: { value: string }) =>
        value ? new Types.ObjectId(value) : null,
    )
    parent?: Types.ObjectId | null;

    @ApiPropertyOptional({ example: 'ACTIVE', enum: ENUM_COMMENT_STATUS })
    @IsOptional()
    @IsEnum(ENUM_COMMENT_STATUS)
    status?: ENUM_COMMENT_STATUS;
}

export class UpdateCommentDto extends PartialType(
    OmitType(CreateCommentDto, ['post'] as const),
) {}

export class MarkSpamDto {
    @ApiProperty({ example: 'SPAM', enum: ENUM_COMMENT_STATUS })
    @IsEnum(ENUM_COMMENT_STATUS)
    status: ENUM_COMMENT_STATUS;
}

export class CommentResponseDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    _id: string;

    @ApiProperty({ example: 'This is a great post!' })
    content: string;

    @ApiProperty({ example: 'ACTIVE', enum: ENUM_COMMENT_STATUS })
    status: ENUM_COMMENT_STATUS;

    @ApiProperty({ example: 0 })
    likeCount: number;

    @ApiProperty({ example: 0 })
    replyCount: number;

    @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
    parent?: string | null;

    @ApiPropertyOptional({ description: 'Post information' })
    post?: any;

    @ApiPropertyOptional({ description: 'Author information' })
    author?: any;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    updatedAt: Date;
}
