# Advanced Stock Price Checker

## Project Overview

The Advanced Stock Price Checker is a backend service developed using Nest.js. It integrates with stock market API Finnhub to fetch real-time stock prices. This service automates periodic checks of stock prices and calculates the moving average to aid users in tracking stock performance over time.

## Getting Started

### Prerequisites

- node.js
- pnpm
- docker

### Installation
```bash
  git clone https://github.com/tothalex/stocker.git
  cd stocker
  pnpm install
```

### Setup Environment
Create .env file, use your Finnhub token based on the .env.example
```bash
DATABASE_URL=postgresql://admin:admin@localhost:5432/db
API_URL=https://finnhub.io/api/v1
API_TOKEN=
```

### Setup database
```bash
docker-compose up
```
```bash
pnpm run prisma:apply
```

### Run locally
```bash
pnpm run start:dev
```

### Run e2e tests locally
```bash
pnpm run test:e2e:local
```
Known issue: because of the cron job the test doesn't exits(TODO: stop cron job from the test)

### Run locally containerized
Add Finnhub token to the docker-compose.dev.yaml app environment
```bash
docker-compose -f docker-compose.dev.yaml up 
```

## API Endpoints
GET api/stock/:symbol - Retrieves the current stock price, the last updated time, and the moving average for the specified stock symbol.
PUT api/stock/:symbol - Starts the periodic checks for the specified stock symbol.

## Swagger documentation
You can access the swagger documentation under: **http://localhost:3000/docs**
