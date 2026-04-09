import { PrismaClient } from './generated/prisma';

export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }
}
