import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsOptional } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables {
    @IsEnum(Environment)
    @IsOptional()
    NODE_ENV: Environment = Environment.Development;

    @IsNumber()
    @IsOptional()
    PORT: number = 3000;

    @IsString()
    @IsOptional()
    DATABASE_URL: string;

    @IsString()
    @IsOptional()
    DATABASE_HOST: string;

    @IsNumber()
    @IsOptional()
    DATABASE_PORT: number;

    @IsString()
    @IsOptional()
    DATABASE_USER: string;

    @IsString()
    @IsOptional()
    DATABASE_PASSWORD: string;

    @IsString()
    @IsOptional()
    DATABASE_NAME: string;

    @IsString()
    @IsOptional()
    REDIS_HOST: string;

    @IsNumber()
    @IsOptional()
    REDIS_PORT: number;

    @IsString()
    @IsOptional()
    REDIS_PASSWORD: string;

    @IsString()
    @IsOptional()
    JWT_SECRET: string;

    @IsString()
    @IsOptional()
    JWT_EXPIRATION: string;

    @IsString()
    @IsOptional()
    CORS_ORIGIN: string;
}

export function validateEnv(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
