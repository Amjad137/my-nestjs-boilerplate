import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ENUM_POST_STATUS } from '../repository/entities/post.entity';
import { BaseEntityDto } from '@common/database/dtos/base.dto';

export class CreatePostDto {
    @ApiProperty({ description: 'Post slug (optional, generated if absent)' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({ description: 'Post content' })
    @IsString()
    content: string;

    @ApiPropertyOptional({ description: 'Featured image URL' })
    @IsOptional()
    @IsString()
    featuredImage?: string;

    @ApiPropertyOptional({
        description: 'Post status',
        enum: ENUM_POST_STATUS,
        default: 'DRAFT',
    })
    @IsOptional()
    @IsEnum(ENUM_POST_STATUS)
    status?: ENUM_POST_STATUS;

    @ApiPropertyOptional({ description: 'Tags' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class PostResponseDto extends BaseEntityDto {
    @ApiProperty({ description: 'Post slug' })
    slug: string;

    @ApiProperty({ description: 'Post content' })
    content: string;

    @ApiPropertyOptional({ description: 'Featured image URL' })
    featuredImage?: string;

    @ApiProperty({ description: 'Post status', enum: ENUM_POST_STATUS })
    status: ENUM_POST_STATUS;

    @ApiPropertyOptional({ description: 'View count' })
    viewCount?: number;

    @ApiPropertyOptional({ description: 'Tags' })
    tags?: string[];

    @ApiPropertyOptional({ description: 'Author' })
    author?: any;

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Published date' })
    publishedAt?: Date;
}
