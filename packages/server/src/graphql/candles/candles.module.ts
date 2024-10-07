import { Module } from '@nestjs/common';
import { CandleAnalysisService } from 'src/services/candle-utilities/candleAnalysis.service';
import { CandlesService } from 'src/services/candle-utilities/candles.service';
import { CandlesResolver } from './candles.resolver';

@Module({
	providers: [CandleAnalysisService, CandlesResolver, CandlesService]
})
export class CandlesGraphQLModule {}
