import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Min } from 'class-validator';
import ETickerSymbolsSortMethod from 'src/enums/ETickerSymbolsSortMethod';

@ArgsType()
class PaginatedTickerSymbolArgs {
	@Field(() => Int, { defaultValue: 1 })
	@Min(1)
	page: number;

	@Field(() => Int, { defaultValue: 25 })
	@Min(1)
	perPage: number;

	@Field(() => String, { defaultValue: '' })
	search: string;

	@Field(() => String, { defaultValue: '' })
	gcis: string;

	@Field(() => ETickerSymbolsSortMethod, { defaultValue: ETickerSymbolsSortMethod.NAME_ASC })
	sort: ETickerSymbolsSortMethod;

	// @Field(() => String, { defaultValue: 'asc' })
	// @Matches(/(^asc$)|(^desc$)/g, { message: 'order field must be "asc" or "desc"' })
	// order: string;

	// @Field(() => String, { defaultValue: 'name' })
	// @Matches(/(^name$)|(^market_cap$)|(^avg_daily_vol$)/g, {
	// 	message: 'orderBy field must be "name", "market_cap", or "avg_daily_vol"'
	// })
	// orderBy: string;
}

export default PaginatedTickerSymbolArgs;
