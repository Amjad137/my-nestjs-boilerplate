import { IBaseEntity } from '@common/database/interfaces/database.interface';
import { BaseEntity } from '@common/database/bases/base.entity';
import {
    DatabaseEntity,
    DatabaseProp,
    DatabaseSchema,
} from '@common/database/decorators/database.decorator';
import { ENUM_USER_ROLE } from '@modules/user/dtos/user.dto';

export const UserTableName = 'Users';

@DatabaseEntity({ collection: UserTableName })
export class UserEntity extends BaseEntity {
    @DatabaseProp({
        required: true,
        trim: true,
        type: String,
        maxlength: 50,
    })
    firstName: string;

    @DatabaseProp({
        required: true,
        trim: true,
        type: String,
        maxlength: 50,
    })
    lastName: string;

    @DatabaseProp({
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
        type: String,
        maxlength: 100,
    })
    email: string;

    @DatabaseProp({
        required: true,
        unique: true,
        index: true,
        trim: true,
        type: String,
        maxlength: 20,
    })
    phoneNumber: string;

    @DatabaseProp({
        required: true,
        type: String,
        trim: true,
    })
    password: string;

    @DatabaseProp({
        required: true,
        enum: ENUM_USER_ROLE,
        default: ENUM_USER_ROLE.USER,
        type: String,
    })
    role: ENUM_USER_ROLE;

    @DatabaseProp({
        required: false,
        trim: true,
        type: String,
    })
    avatar?: string;

    @DatabaseProp({
        required: true,
        trim: true,
        type: String,
        maxlength: 500,
    })
    address: string;

    @DatabaseProp({
        required: true,
        default: true,
        type: Boolean,
    })
    isActive: boolean;

    @DatabaseProp({
        required: true,
        default: false,
        type: Boolean,
    })
    isEmailVerified: boolean;

    @DatabaseProp({
        required: false,
        type: String,
    })
    emailVerificationToken?: string;

    @DatabaseProp({
        required: false,
        type: String,
    })
    passwordResetToken?: string;

    @DatabaseProp({
        required: false,
        type: Date,
    })
    passwordResetExpires?: Date;

    @DatabaseProp({
        required: false,
        type: Date,
    })
    lastLoginAt?: Date;

    @DatabaseProp({
        required: true,
        type: String,
    })
    salt: string;
}

export const UserSchema = DatabaseSchema(UserEntity);
export type UserDocument = UserEntity & IBaseEntity;
