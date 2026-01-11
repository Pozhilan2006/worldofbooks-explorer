import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { NavigationModule } from './modules/navigation/navigation.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';

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
export class AppModule { }
