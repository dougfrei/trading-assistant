import { Module } from '@nestjs/common';
import { TickerSymbolNewsResolver } from './tickerSymbolNews.resolver';

@Module({
	providers: [TickerSymbolNewsResolver]
})
export class TickerSymbolNewsGraphQLModule {}
