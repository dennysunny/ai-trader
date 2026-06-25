import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

/**
 * DatabaseService is a NestJS service that extends the PrismaClient to provide database access and management functionalities.
 * It implements the OnModuleInit interface to establish a connection to the database when the module is initialized.
 */
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
