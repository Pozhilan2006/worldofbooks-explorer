import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SessionMiddleware } from './common/middleware/session.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { NavigationModule } from './modules/navigation/navigation.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { ViewHistoryModule } from './modules/view-history/view-history.module';
import { ScrapeModule } from './modules/scrape/scrape.module';

@Module({
    imports: [
        // Global configuration module
        ConfigModule.forRoot({
            isGlobal: true, // Make ConfigModule available globally
            envFilePath: ['.env.local', '.env'], // Load environment files in order
            validate: validateEnv, // Validate environment variables on startup
            cache: true, // Cache environment variables for better performance
        }),
        // Feature modules
        NavigationModule,
        CategoryModule,
        ProductModule,
        ViewHistoryModule,
        ScrapeModule.forRoot(), // Dynamic module with conditional BullMQ
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // Global exception filter
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(SessionMiddleware)
            .forRoutes('*'); // Apply to all routes
    }
}
