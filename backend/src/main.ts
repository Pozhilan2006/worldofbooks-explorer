import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';

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

    // Verify PORT exists as required by hosting provider
    const port = process.env.PORT ? Number(process.env.PORT) : null;
    if (!port) {
        throw new Error('PORT is not defined in environment variables');
    }

    const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

    // Must listen on 0.0.0.0 for Railway/Render
    await app.listen(port, '0.0.0.0');

    logger.log(`🚀 Application is running on: http://0.0.0.0:${port}/api`);
    logger.log(`📝 Environment: ${nodeEnv}`);
    logger.log(`🌐 CORS enabled for: ${corsOrigin}`);

    // Background initialization to prevent startup blocking
    (async () => {
        try {
            const prisma = app.get(PrismaService);
            logger.log('Starting background connection to DB & Redis...');

            await prisma.$connect();

            // Check Redis
            const { redisConnection } = await import('./redis/redis.config');
            if (redisConnection.status !== 'ready') {
                await redisConnection.ping();
            }

            logger.log('✅ Background init: DB & Redis connected');
        } catch (err) {
            logger.error('❌ Background init failed:', err);
        }
    })();
}

bootstrap();

/* ⬇️ Everything below runs AFTER server is live */
(async () => {
    try {
        const { redisConnection } = await import('./redis/redis.config');
        // We need to get PrismaService from the app context, but we can't access 'app' here easily if we are outside bootstrap.
        // So we should move this inside bootstrap or export app?
        // Actually, user example has this OUTSIDE. But they used global variables or simplified code.
        // In NestJS, we can do it at end of bootstrap.
    } catch (err) {
        console.error("Background init failed:", err);
    }
})();
