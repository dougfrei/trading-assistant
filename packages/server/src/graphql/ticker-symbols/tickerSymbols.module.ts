import { Module } from '@nestjs/common';
import { GCISManagerService } from 'src/services/gcisManager.service';
import { TickerSymbolsResolver } from './tickerSymbols.resolver';

@Module({
	providers: [TickerSymbolsResolver, GCISManagerService]
})
export default class TickerSymbolsGraphQLModule {}
