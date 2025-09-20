import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '@common/database/bases/base.repository';
import { InjectDatabaseModel } from '@common/database/decorators/database.decorator';
import {
    UserDocument,
    UserEntity,
} from '@modules/user/repository/entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity, UserDocument> {
    constructor(
        @InjectDatabaseModel(UserEntity.name)
        private readonly userModel: Model<UserEntity>,
    ) {
        super(userModel);
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.findOne({ email });
    }

    async findByEmailVerificationToken(
        token: string,
    ): Promise<UserDocument | null> {
        return this.findOne({ emailVerificationToken: token });
    }

    async findByPasswordResetToken(
        token: string,
    ): Promise<UserDocument | null> {
        return this.findOne({ passwordResetToken: token });
    }

    async updateLastLogin(_id: Types.ObjectId): Promise<UserDocument> {
        return this.updateOneById(_id, {
            lastLoginAt: new Date(),
        });
    }
}
