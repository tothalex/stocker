import { Decimal } from 'decimal.js'

Decimal.config({
  precision: 10,
  rounding: Decimal.ROUND_HALF_UP,
})

export { Decimal }
