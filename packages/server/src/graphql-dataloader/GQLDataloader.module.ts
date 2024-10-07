import { Module } from '@nestjs/common';
import { CandleAnalysisService } from 'src/services/candle-utilities/candleAnalysis.service';
import { GQLDataloaderService } from './GQLDataloader.service';

@Module({
	providers: [GQLDataloaderService, CandleAnalysisService],
	exports: [GQLDataloaderService]
})
export class GQLDataloaderModule {}
