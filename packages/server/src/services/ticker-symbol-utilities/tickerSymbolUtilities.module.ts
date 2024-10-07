import { Module } from '@nestjs/common';
import { TickerSymbolToolsService } from '../tickerSymbolTools.service';

@Module({
	providers: [TickerSymbolToolsService],
	exports: [TickerSymbolToolsService]
})
export class TickerSymbolUtilitiesModule {}
