import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from '@common/common.module';
import { AppMiddlewareModule } from '@app/app.middleware.module';
import { RouterModule } from '@router';
import { ResponseInterceptor } from '@common/response/interceptors/response.interceptor';

@Module({
    controllers: [],
    providers: [
        // Apply ResponseInterceptor globally to all routes
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
    ],
    imports: [
        // Common
        CommonModule,
        AppMiddlewareModule,

        // Routes
        RouterModule,
    ],
})
export class AppModule {}
