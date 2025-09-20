import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
    HealthCheck,
    HealthCheckService,
    MongooseHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private mongoose: MongooseHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    @ApiOperation({ summary: 'Health check' })
    @ApiResponse({ status: 200, description: 'Health check successful' })
    check() {
        console.log('Health check');
        return this.health.check([() => this.mongoose.pingCheck('mongodb')]);
    }
}
