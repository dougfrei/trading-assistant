import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import ETradePeriodType from 'src/enums/ETradePerformancePeriodType';
import { Trade } from 'src/graphql/trades/trade.model';

@ObjectType({ description: 'trade performance period' })
export class TradePerformancePeriod {
	@Field(() => ETradePeriodType)
	periodType: ETradePeriodType;

	@Field(() => Date)
	period: Date;

	@Field(() => Float)
	pnl: number;

	@Field(() => Float)
	winRate: number;

	@Field(() => Float)
	profitFactor: number;

	@Field(() => Int)
	numWinners: number;

	@Field(() => Int)
	numLosers: number;

	@Field(() => Int)
	numScratch: number;

	@Field(() => Trade)
	trades: Trade[];
}
