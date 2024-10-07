import { Module } from '@nestjs/common';
import { CandleAnalysisService } from 'src/services/candle-utilities/candleAnalysis.service';
import { CandlesService } from 'src/services/candle-utilities/candles.service';
import { AVWAPResolver } from './AVWAP.resolver';

@Module({
	providers: [AVWAPResolver, CandlesService, CandleAnalysisService]
})
export class AVWAPGraphQLModule {}
