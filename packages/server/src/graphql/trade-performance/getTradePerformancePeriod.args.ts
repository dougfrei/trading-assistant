import { ArgsType, Field, Int } from '@nestjs/graphql';
import { ETradeInstrumentType } from '@trading-assistant/common';
import ETradePerformancePeriodType from 'src/enums/ETradePerformancePeriodType';

@ArgsType()
class GetTradePerformancePeriodsArgs {
	@Field(() => Date, { nullable: true })
	startDate?: Date;

	@Field(() => Int, { nullable: true })
	numPeriods?: number;

	@Field(() => ETradePerformancePeriodType, { defaultValue: ETradePerformancePeriodType.DAY })
	periodType: ETradePerformancePeriodType;

	@Field(() => Int, { defaultValue: 0 })
	accountId: number;

	@Field(() => ETradeInstrumentType, { nullable: true })
	instrumentType?: ETradeInstrumentType;
}

export default GetTradePerformancePeriodsArgs;
