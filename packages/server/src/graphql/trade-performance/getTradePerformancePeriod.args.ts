import { ArgsType, Field, Int } from '@nestjs/graphql';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { getDaysInMonth, startOfMonth } from 'date-fns';
import ETradePerformancePeriodType from 'src/enums/ETradePerformancePeriodType';

@ArgsType()
class GetTradePerformancePeriodsArgs {
	@Field(() => Date, { defaultValue: startOfMonth(new Date()) })
	startDate: Date;

	@Field(() => Int, { defaultValue: getDaysInMonth(new Date()) })
	numPeriods: number;

	@Field(() => ETradePerformancePeriodType, { defaultValue: ETradePerformancePeriodType.DAY })
	periodType: ETradePerformancePeriodType;

	@Field(() => Int, { defaultValue: 0 })
	accountId: number;

	@Field(() => ETradeInstrumentType, { nullable: true })
	instrumentType?: ETradeInstrumentType;
}

export default GetTradePerformancePeriodsArgs;
