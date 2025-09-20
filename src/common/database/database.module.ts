import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    UserEntity,
    UserSchema,
} from '@modules/user/repository/entities/user.entity';
import { DatabaseService } from '@common/database/services/database.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserEntity.name,
                schema: UserSchema,
            },
        ]),
    ],
    providers: [DatabaseService],
    exports: [MongooseModule, DatabaseService],
})
export class DatabaseModule {}
