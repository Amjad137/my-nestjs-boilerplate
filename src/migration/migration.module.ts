import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { CommonModule } from '@common/common.module';
import { UserModule } from '@modules/user/user.module';
import { UserSeed } from './seeds/user.seed';

@Module({
    imports: [CommandModule, CommonModule, UserModule],
    providers: [UserSeed],
})
export class MigrationModule {}
