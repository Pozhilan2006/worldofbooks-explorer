import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Cookie parser middleware
    app.use(cookieParser());

    const configService = app.get(ConfigService);

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip properties that don't have decorators
            forbidNonWhitelisted: true, // Throw error if non-whitelisted values are provided
            transform: true, // Automatically transform payloads to DTO instances
            transformOptions: {
                enableImplicitConversion: true, // Allow implicit type conversion
            },
        }),
    );

    // CORS configuration
    const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3001';
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
    });

    // Global prefix for all routes
    app.setGlobalPrefix('api');

    const port = configService.get<number>('PORT') || 3000;
    const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
    logger.log(`📝 Environment: ${nodeEnv}`);
    logger.log(`🌐 CORS enabled for: ${corsOrigin}`);
}

bootstrap();
