import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentService } from '@modules/comment/comment.service';
import { CommentController } from '@modules/comment/comment.controller';
import { CommentRepository } from '@modules/comment/repository/repositories/comment.repository';
import { PostRepository } from '@modules/post/repository/repositories/post.repository';
import {
    CommentEntity,
    CommentSchema,
} from '@modules/comment/repository/entities/comment.entity';
import {
    PostEntity,
    PostSchema,
} from '@modules/post/repository/entities/post.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: CommentEntity.name, schema: CommentSchema },
            { name: PostEntity.name, schema: PostSchema },
        ]),
    ],
    controllers: [CommentController],
    providers: [CommentService, CommentRepository, PostRepository],
    exports: [CommentService, CommentRepository],
})
export class CommentModule {}
