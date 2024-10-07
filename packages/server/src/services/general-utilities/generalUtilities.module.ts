import { Module } from '@nestjs/common';
import { NYSEMarketDaysMathService } from './nyseMarketDaysMath.service';

@Module({
	providers: [NYSEMarketDaysMathService],
	exports: [NYSEMarketDaysMathService]
})
export class GeneralUtilitiesModule {}
