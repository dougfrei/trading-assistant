import { ArgsType, Field, Int } from '@nestjs/graphql';
import { ECandlePeriodType, ECandleSortOrder } from '@trading-assistant/common';

@ArgsType()
export class CandlesArgs {
	@Field({ nullable: false })
	tickerSymbol: string;

	@Field(() => ECandlePeriodType, { defaultValue: ECandlePeriodType.D })
	periodType: ECandlePeriodType;

	@Field(() => ECandleSortOrder, { defaultValue: ECandleSortOrder.PERIOD_DESC })
	sortOrder: ECandleSortOrder;

	@Field(() => Int, { defaultValue: 0 })
	limit: number;
}
