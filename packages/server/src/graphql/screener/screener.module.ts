import { Module } from '@nestjs/common';
import { CandleAnalysisService } from 'src/services/candle-utilities/candleAnalysis.service';
import { CandlesService } from 'src/services/candle-utilities/candles.service';
import { GCISManagerService } from 'src/services/gcisManager.service';
import { ScreenerService } from 'src/services/screener.service';
import { ScreenerResolver } from './screener.resolver';

@Module({
	providers: [
		CandleAnalysisService,
		CandlesService,
		ScreenerService,
		ScreenerResolver,
		GCISManagerService
	]
})
export class ScreenerGraphQLModule {}
