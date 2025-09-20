import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ENVIRONMENT {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    TEST = 'test',
}

export class AppHttpDto {
    @IsString()
    @IsOptional()
    host?: string;

    @IsNumber()
    @IsOptional()
    port?: number;
}

export class AppUrlVersionDto {
    @IsString()
    @IsOptional()
    enable?: boolean;

    @IsString()
    @IsOptional()
    prefix?: string;

    @IsString()
    @IsOptional()
    version?: string;
}

export class AppEnvDto {
    @IsEnum(ENVIRONMENT)
    @IsOptional()
    env?: ENVIRONMENT;

    @IsString()
    @IsOptional()
    timezone?: string;

    @ValidateNested()
    @Type(() => AppHttpDto)
    @IsOptional()
    http?: AppHttpDto;

    @IsString()
    @IsOptional()
    globalPrefix?: string;

    @ValidateNested()
    @Type(() => AppUrlVersionDto)
    @IsOptional()
    urlVersion?: AppUrlVersionDto;

    @IsString()
    @IsOptional()
    version?: string;
}
