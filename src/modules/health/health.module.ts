import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from '@modules/health/health.controller';

@Module({
    imports: [
        TerminusModule.forRoot({
            gracefulShutdownTimeoutMs: 1000,
        }),
        MongooseModule,
    ],
    controllers: [HealthController],
    providers: [],
    exports: [],
})
export class HealthModule {}
