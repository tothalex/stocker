import {
  Controller,
  Get,
  Param,
  Put,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'

import { StockService } from './stock.service'
import { Decimal } from '../decimal'

@Controller('api/stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Get(':symbol')
  async find(@Param('symbol') symbol: string) {
    const stockPrices = await this.stockService.getPrices({
      take: 10,
      orderBy: {
        timestamp: 'desc',
      },
      where: {
        symbol,
      },
    })

    let sum = new Decimal(0)
    stockPrices.forEach((stockPrice) => {
      sum = sum.plus(new Decimal(stockPrice.price))
    })
    const average = sum.div(new Decimal(stockPrices.length))

    return {
      average,
    }
  }

  @Put(':symbol')
  async subscribe(@Param('symbol') symbol: string) {
    const response = await this.stockService.getMetric(symbol)
    if (Object.keys(response.data.metric).length === 0) {
      throw new NotFoundException()
    }

    try {
      await this.stockService.subscribe(symbol)
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException()
    }

    return 'OK'
  }
}
