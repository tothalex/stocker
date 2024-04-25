import { ApiProperty } from '@nestjs/swagger'

export class GetStockResponse {
  @ApiProperty({ example: '169.5', description: 'Average moving stock price' })
  average: string

  @ApiProperty({ example: '170', description: 'Current stock price' })
  price: string

  @ApiProperty({
    example: '2024-04-25T11:28:25.282Z',
    description: 'Last seen price timestamp',
  })
  timestamp: string
}

export class SubscribeResponse {
  @ApiProperty({
    description: 'Message reflecting the subscription has been succeeded',
    example: 'Subscription succeeded',
  })
  message: string

  @ApiProperty({
    description: 'Subscribe stock symbol',
    example: 'AAPL',
  })
  symbol: string
}

export class ErrorResponse {
  @ApiProperty({
    description: 'Message reflecting the issue',
  })
  message: string

  @ApiProperty({
    description: 'The symbol what the request failed on',
  })
  symbol: string
}
