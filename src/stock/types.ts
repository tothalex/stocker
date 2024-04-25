export type QuoteReponse = {
  data: {
    // current price
    c: number
    // change
    d: number
    // percent change
    dp: number
    // high price of the day
    h: number
    // low price of the day
    l: number
    // open price of the day
    o: number
    // previous close price
    pc: number
    // ??
    t: number
  }
}

export type MarketStatusResponse = {
  data: {
    exchange: string
    isOpen: boolean
    session: string
    t: number
    timezone: string
  }
}
