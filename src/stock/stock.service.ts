import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AxiosResponse } from 'axios'

import { PrismaService } from '../prisma'
import { HttpService } from '@nestjs/axios'
import { QuoteReponse } from './types'
import { Prisma } from '@prisma/client'

@Injectable()
export class StockService {
  private readonly API_URL = process.env.API_URL
  private readonly API_TOKEN = process.env.API_TOKEN

  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async getMetric(symbol: string): Promise<AxiosResponse> {
    return this.httpService.axiosRef.get(`${this.API_URL}/stock/metric`, {
      params: {
        symbol,
        token: this.API_TOKEN,
        metric: 'all',
      },
    })
  }

  async subscribe(symbol: string) {
    await this.prisma.stock.upsert({
      where: {
        symbol,
      },
      create: {
        symbol,
      },
      update: {},
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

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
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

  private async getQuote(symbol: string): Promise<QuoteReponse> {
    return this.httpService.axiosRef.get(`${this.API_URL}/quote`, {
      params: {
        symbol,
        token: this.API_TOKEN,
      },
    })
  }
}
