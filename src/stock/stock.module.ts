import { Module } from '@nestjs/common'

import { StockController } from './stock.controller'
import { PrismaModule } from '../prisma'

@Module({
  imports: [PrismaModule],
  controllers: [StockController],
  providers: [],
})
export class StockModule {}
