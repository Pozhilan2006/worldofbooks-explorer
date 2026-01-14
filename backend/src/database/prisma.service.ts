import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
    // Connection is handled in main.ts background process
    // async onModuleInit() {
    //    await this.$connect();
    // }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
