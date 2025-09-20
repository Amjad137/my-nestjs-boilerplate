import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseEntityDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    _id: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    updatedAt: Date;

    @ApiPropertyOptional({ example: '507f1f77bcf86cd799439012' })
    createdBy?: string;

    @ApiPropertyOptional({ example: '507f1f77bcf86cd799439013' })
    updatedBy?: string;

    @ApiPropertyOptional({ example: false })
    deleted?: boolean;

    @ApiPropertyOptional({ example: '2024-01-02T00:00:00.000Z' })
    deletedAt?: Date;

    @ApiPropertyOptional({ example: '507f1f77bcf86cd799439014' })
    deletedBy?: string;
}
