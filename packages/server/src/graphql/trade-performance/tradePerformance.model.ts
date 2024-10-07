import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { TradePerformancePeriod } from 'src/graphql/trade-performance/tradePerformancePeriod.model';

@ObjectType({ description: 'trade performance' })
export class TradePerformance {
	@Field(() => Float)
	totalPnl: number;

	@Field(() => Float)
	totalWinRate: number;

	@Field(() => Float)
	totalProfitFactor: number;

	@Field(() => Int)
	totalWinners: number;

	@Field(() => Int)
	totalLosers: number;

	@Field(() => Int)
	totalScratch: number;

	@Field(() => [TradePerformancePeriod])
	periods: TradePerformancePeriod[];
}
