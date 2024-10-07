import { ArgsType, Field } from '@nestjs/graphql';
import { ECandlePeriodType } from '@trading-assistant/common';
import { YMDDateString } from 'src/graphql-scalars/YMDDateString';

@ArgsType()
export class AVWAPArgs {
	@Field()
	tickerSymbol: string;

	@Field(() => ECandlePeriodType, { defaultValue: ECandlePeriodType.D, nullable: true })
	periodType: ECandlePeriodType;

	@Field(() => YMDDateString)
	startDate: string;
}
