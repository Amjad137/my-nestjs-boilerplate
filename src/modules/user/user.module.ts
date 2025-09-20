import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from '@modules/user/user.service';
import { UserController } from '@modules/user/user.controller';
import { UserRepository } from '@modules/user/repository/repositories/user.repository';
import {
    UserEntity,
    UserSchema,
} from '@modules/user/repository/entities/user.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserEntity.name, schema: UserSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserService, UserRepository],
})
export class UserModule {}
