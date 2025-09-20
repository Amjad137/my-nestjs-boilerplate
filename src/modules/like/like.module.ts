import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from '@modules/like/like.service';
import { LikeController } from '@modules/like/like.controller';
import { LikeRepository } from '@modules/like/repositories/like.repository';
import { LikeEntity, LikeSchema } from '@modules/like/entities/like.entity';
import { PostRepository } from '@modules/post/repository/repositories/post.repository';
import {
    PostEntity,
    PostSchema,
} from '@modules/post/repository/entities/post.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: LikeEntity.name, schema: LikeSchema },
            { name: PostEntity.name, schema: PostSchema },
        ]),
    ],
    controllers: [LikeController],
    providers: [LikeService, LikeRepository, PostRepository],
    exports: [LikeService],
})
export class LikeModule {}
