import { ArgsType, Field, Int } from '@nestjs/graphql';
import { ECandlePeriodType } from '@trading-assistant/common';
import { Min } from 'class-validator';
import EScreenerSortMethod from 'src/enums/EScreenerSortMethod';

@ArgsType()
class ScreenerRecordsArgs {
	@Field(() => ECandlePeriodType, { defaultValue: 'D' })
	periodType: ECandlePeriodType;

	@Field(() => Int, { defaultValue: 1 })
	@Min(1)
	page: number;

	@Field(() => Int, { defaultValue: 25 })
	@Min(1)
	perPage: number;

	@Field(() => EScreenerSortMethod, { defaultValue: EScreenerSortMethod.TICKER })
	sort: EScreenerSortMethod;

	@Field(() => String, { defaultValue: '' })
	sectorGCIS: string;

	@Field(() => Int, { defaultValue: 0 })
	@Min(0)
	queryId: number;
}

export default ScreenerRecordsArgs;
