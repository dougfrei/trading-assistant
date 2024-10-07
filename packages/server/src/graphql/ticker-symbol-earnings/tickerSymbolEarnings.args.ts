import { ArgsType, Field } from '@nestjs/graphql';
import { YMDDateString } from 'src/graphql-scalars/YMDDateString';

@ArgsType()
export class TickerSymbolEarningsArgs {
	@Field(() => YMDDateString, { nullable: true })
	startDate?: string;

	@Field(() => YMDDateString, { nullable: true })
	endDate?: string;
}
