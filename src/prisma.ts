import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
