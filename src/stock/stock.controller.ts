import {
  Controller,
  Get,
  Param,
  Put,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { ApiResponse } from '@nestjs/swagger'

import { StockService } from './stock.service'
import { Decimal } from '../decimal'
import { ErrorResponse, GetStockResponse, SubscribeResponse } from './stock.dto'

@Controller('api/stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @Get(':symbol')
  @ApiResponse({
    status: 200,
    description: 'Get stock price information',
    type: GetStockResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Error when tyring to get stock price information',
    type: ErrorResponse,
  })
  async get(@Param('symbol') symbol: string): Promise<GetStockResponse> {
    const stockPrices = await this.stockService.getPrices({
      take: 10,
      orderBy: {
        timestamp: 'desc',
      },
      where: {
        symbol,
      },
    })

    if (stockPrices.length === 0) {
      throw new NotFoundException({
        message: `No price for *${symbol}*, please subscribe!`,
        symbol,
      })
    }

    let sum = new Decimal(0)
    stockPrices.forEach((stockPrice) => {
      sum = sum.plus(new Decimal(stockPrice.price))
    })
    const average = sum.div(new Decimal(stockPrices.length))
    const [stockPrice] = stockPrices

    return {
      average: average.toString(),
      price: stockPrice.price,
      timestamp: stockPrice.timestamp.toISOString(),
    }
  }

  @Put(':symbol')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Subscribe to a stock with the symbol',
    type: SubscribeResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Unable to find price for the given symbol',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Already subscribed for the given symbol',
    type: ErrorResponse,
  })
  async subscribe(@Param('symbol') symbol: string): Promise<SubscribeResponse> {
    const { data } = await this.stockService.getQuote(symbol)

    if (data.c === 0) {
      throw new NotFoundException({
        message: `Couldn't find any price for *${symbol}*, symbol might be incorrent or not in theUS stock market`,
        symbol,
      })
    }

    try {
      await this.stockService.subscribe(symbol)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException({
            message: `Already subscribed to *${symbol}*!`,
            symbol,
          })
        }
      }

      console.error(error)
      throw new InternalServerErrorException()
    }

    try {
      await this.stockService.insertStockPrice({
        symbol,
        price: data.c.toString(),
      })
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException()
    }

    return {
      message: 'Subscription succeeded',
      symbol,
    }
  }
}
