-- CreateTable
CREATE TABLE "Stock" (
    "symbol" TEXT NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "StockPrice" (
    "id" SERIAL NOT NULL,
    "price" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "StockPrice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockPrice" ADD CONSTRAINT "StockPrice_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "Stock"("symbol") ON DELETE RESTRICT ON UPDATE CASCADE;
