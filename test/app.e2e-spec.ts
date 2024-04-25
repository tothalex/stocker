import * as request from 'supertest'
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'

import { AppModule } from './../src/app.module'
import { PrismaService } from '../src/prisma'
import { stockPrices } from './helpers/stockPrices'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let prismaService: PrismaService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    prismaService = app.get<PrismaService>(PrismaService)
    await prismaService.cleanDb()
  })

  afterAll(async () => {
    await prismaService.cleanDb()
    await prismaService.$disconnect()
  })

  it('should throw not found price', () => {
    const response = request(app.getHttpServer()).get('/api/stock/AAPL')

    return response.expect(404).expect({
      message: 'No price for *AAPL*, please subscribe!',
      symbol: 'AAPL',
    })
  })

  it('should return price for one existing stock price for a stock', async () => {
    await prismaService.stock.create({
      data: {
        symbol: 'AAPL',
        prices: {
          create: {
            price: '169',
            timestamp: '2024-04-25T11:28:25.282Z',
          },
        },
      },
    })

    const response = request(app.getHttpServer()).get('/api/stock/AAPL')

    return response.expect(200).expect({
      average: '169',
      price: '169',
      timestamp: '2024-04-25T11:28:25.282Z',
    })
  })

  it('should return correct average for 10 existing stock price for a stock', async () => {
    await prismaService.stock.create({
      data: {
        symbol: 'AAPL',
        prices: {
          createMany: {
            data: stockPrices,
          },
        },
      },
    })

    const response = request(app.getHttpServer()).get('/api/stock/AAPL')

    return response.expect(200).expect({
      average: '169.679',
      price: '167',
      timestamp: '2024-04-25T11:30:25.282Z',
    })
  })

  it('should subscribe for a valid stock', async () => {
    const response = request(app.getHttpServer()).put('/api/stock/AAPL')

    response.expect(201).expect({
      message: 'Subscription succeeded',
      symbol: 'AAPL',
    })
  })
})
