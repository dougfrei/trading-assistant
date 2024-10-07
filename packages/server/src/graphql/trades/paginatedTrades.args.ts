import { ArgsType, Field, Int } from '@nestjs/graphql';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { Min } from 'class-validator';

@ArgsType()
class PaginatedTradesArgs {
	@Field(() => Int, { defaultValue: 1 })
	@Min(1)
	page: number;

	@Field(() => Int, { defaultValue: 25 })
	@Min(1)
	perPage: number;

	@Field(() => Int, { defaultValue: 0 })
	@Min(0)
	accountId: number;

	@Field(() => ETradeInstrumentType, { nullable: true })
	instrumentType?: ETradeInstrumentType;

	@Field(() => String, { defaultValue: '' })
	tickerSymbol: string;

	@Field(() => String, { defaultValue: '' })
	optionSpreadTemplate: string;

	@Field({ nullable: true })
	isClosed?: boolean;
}

export default PaginatedTradesArgs;
