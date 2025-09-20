import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '@common/database/bases/base.repository';
import { InjectDatabaseModel } from '@common/database/decorators/database.decorator';
import {
    LikeDocument,
    LikeEntity,
    ENUM_LIKE_TYPE,
} from '@modules/like/entities/like.entity';

@Injectable()
export class LikeRepository extends BaseRepository<LikeEntity, LikeDocument> {
    constructor(
        @InjectDatabaseModel(LikeEntity.name)
        private readonly likeModel: Model<LikeEntity>,
    ) {
        super(likeModel);
    }

    async findByUserAndTarget(
        userId: string | Types.ObjectId,
        targetId: string | Types.ObjectId,
        likeType: ENUM_LIKE_TYPE,
    ): Promise<LikeDocument | null> {
        const uniqueKey = `${userId}_${targetId}_${likeType}`;
        return this.findOne({ uniqueKey });
    }

    async findByUser(
        userId: string | Types.ObjectId,
        likeType?: ENUM_LIKE_TYPE,
    ): Promise<LikeDocument[]> {
        const filter: any = { user: new Types.ObjectId(userId) };
        if (likeType) {
            filter.likeType = likeType;
        }
        return this.findAll(filter) as Promise<LikeDocument[]>;
    }

    async findByTarget(
        targetId: string | Types.ObjectId,
        likeType: ENUM_LIKE_TYPE,
    ): Promise<LikeDocument[]> {
        return this.findAll({
            targetId: new Types.ObjectId(targetId),
            likeType,
        }) as Promise<LikeDocument[]>;
    }

    async countByTarget(
        targetId: string | Types.ObjectId,
        likeType: ENUM_LIKE_TYPE,
    ): Promise<number> {
        return this.count({
            targetId: new Types.ObjectId(targetId),
            likeType,
        });
    }

    async deleteByUserAndTarget(
        userId: string | Types.ObjectId,
        targetId: string | Types.ObjectId,
        likeType: ENUM_LIKE_TYPE,
    ): Promise<boolean> {
        const uniqueKey = `${userId}_${targetId}_${likeType}`;
        return this.delete({ uniqueKey });
    }

    async deleteByTarget(
        targetId: string | Types.ObjectId,
        likeType: ENUM_LIKE_TYPE,
    ): Promise<boolean> {
        return this.deleteMany({
            targetId: new Types.ObjectId(targetId),
            likeType,
        });
    }
}
