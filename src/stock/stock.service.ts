import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { PrismaService } from '../prisma'
import { HttpService } from '@nestjs/axios'
import { MarketStatusResponse, QuoteReponse } from './types'
import { Prisma } from '@prisma/client'

@Injectable()
export class StockService {
  private readonly API_URL = process.env.API_URL
  private readonly API_TOKEN = process.env.API_TOKEN

  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  public async getQuote(symbol: string): Promise<QuoteReponse> {
    return this.httpService.axiosRef.get(`${this.API_URL}/quote`, {
      params: {
        symbol,
        token: this.API_TOKEN,
      },
    })
  }

  async subscribe(symbol: string) {
    return this.prisma.stock.create({
      data: {
        symbol,
      },
    })
  }

  async insertStockPrice(params: { symbol: string; price: string }) {
    const { symbol, price } = params

    return this.prisma.stockPrice.create({
      data: {
        symbol,
        price,
      },
    })
  }

  async getPrices(params: {
    skip?: number
    take?: number
    cursor?: Prisma.StockPriceWhereUniqueInput
    where?: Prisma.StockPriceWhereInput
    orderBy?: Prisma.StockPriceOrderByWithRelationInput
  }) {
    const { skip, take, cursor, where, orderBy } = params

    return this.prisma.stockPrice.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'market-price-poll',
  })
  async handleCron() {
    const { data } = await this.getMarketStatus()

    if (!data.isOpen) {
      return
    }

    const stocks = await this.prisma.stock.findMany()
    stocks.forEach(async (stock) => {
      try {
        const quote = await this.getQuote(stock.symbol)
        await this.prisma.stockPrice.create({
          data: {
            symbol: stock.symbol,
            price: quote.data.c.toString(),
          },
        })
      } catch (error) {
        console.error(error)
      }
    })
  }

  private async getMarketStatus(): Promise<MarketStatusResponse> {
    return this.httpService.axiosRef.get(
      `${this.API_URL}/stock/market-status`,
      {
        params: {
          exchange: 'US',
          token: this.API_TOKEN,
        },
      },
    )
  }
}
