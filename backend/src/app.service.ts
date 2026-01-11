import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
    constructor(private configService: ConfigService) { }

    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: this.configService.get<string>('NODE_ENV'),
            version: '1.0.0',
        };
    }
}
