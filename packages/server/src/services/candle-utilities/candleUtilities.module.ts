import { Module } from '@nestjs/common';
import { CandleAnalysisService } from './candleAnalysis.service';
import { CandlesService } from './candles.service';

@Module({
	providers: [CandlesService, CandleAnalysisService],
	exports: [CandlesService, CandleAnalysisService]
})
export class CandleUtilitiesModule {}
