import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from '@modules/post/post.controller';
import { PostRepository } from '@modules/post/repository/repositories/post.repository';
import {
    PostEntity,
    PostSchema,
} from '@modules/post/repository/entities/post.entity';
import { PostService } from './post.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: PostEntity.name, schema: PostSchema },
        ]),
    ],
    controllers: [PostController],
    providers: [PostService, PostRepository],
    exports: [PostService, PostRepository],
})
export class PostModule {}
