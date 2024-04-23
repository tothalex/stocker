import { Controller, Get, Put } from '@nestjs/common'

@Controller('api/stock')
export class StockController {
  @Get()
  find(): string {
    return 'Hello World!'
  }

  @Put()
  subscribe(): string {
    return 'Hello World!'
  }
}
