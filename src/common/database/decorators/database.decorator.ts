import { Type } from '@nestjs/common';
import {
    InjectConnection,
    InjectModel,
    Prop,
    PropOptions,
    Schema,
    SchemaFactory,
    SchemaOptions,
} from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { IDatabaseQueryContainOptions } from '@common/database/interfaces/database.interface';

export function InjectDatabaseConnection(): ParameterDecorator {
    return InjectConnection();
}

export function InjectDatabaseModel(entity: any): ParameterDecorator {
    return InjectModel(entity);
}

export function DatabaseEntity(options?: SchemaOptions): ClassDecorator {
    return Schema({
        ...options,
        versionKey: false,
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        },
    });
}

export function DatabaseProp(options?: PropOptions): PropertyDecorator {
    return Prop(options);
}

export function DatabaseSchema<T = any, N = MongooseSchema<T>>(
    entity: Type<T>,
): N {
    return SchemaFactory.createForClass<T>(entity) as N;
}

export function DatabaseHelperQueryContain(
    field: string,
    value: string,
    options?: IDatabaseQueryContainOptions,
) {
    if (options?.fullWord) {
        return {
            [field]: {
                $regex: new RegExp(`\\b${value}\\b`),
                $options: 'i',
            },
        };
    }

    return {
        [field]: {
            $regex: new RegExp(value),
            $options: 'i',
        },
    };
}
