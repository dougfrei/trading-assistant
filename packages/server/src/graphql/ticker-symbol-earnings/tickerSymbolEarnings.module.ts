import { Module } from '@nestjs/common';
import { TickerSymbolEarningsResolver } from './tickerSymbolEarnings.resolver';

@Module({
	providers: [TickerSymbolEarningsResolver]
})
export class TickerSymbolEarningsGraphQLModule {}
