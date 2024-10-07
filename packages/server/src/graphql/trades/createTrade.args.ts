import { ArgsType, Field, Int } from '@nestjs/graphql';
import { TTradePosition } from '@trading-assistant/common';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { MaxLength, MinLength } from 'class-validator';
import { GraphQLJSON } from 'graphql-scalars';
import { TradePriceLevelInputType } from 'src/graphql/trades/tradePriceLevel.input';

@ArgsType()
class CreateTradeArgs {
	@Field(() => Int)
	accountId: number;

	@Field(() => ETradeInstrumentType)
	instrumentType: ETradeInstrumentType;

	@MinLength(1)
	@MaxLength(10)
	@Field(() => String)
	tickerSymbol: string;

	@Field(() => String, { defaultValue: '' })
	optionSpreadTemplate: string;

	@Field(() => [TradePriceLevelInputType], { defaultValue: [] })
	stopLossLevels: TradePriceLevelInputType[];

	@Field(() => [TradePriceLevelInputType], { defaultValue: [] })
	profitTargetLevels: TradePriceLevelInputType[];

	@Field(() => GraphQLJSON)
	positions: TTradePosition[];

	@Field(() => [Int], { defaultValue: [] })
	tagIds: number[];

	@Field(() => String, { defaultValue: '' })
	notes: string;
}

export default CreateTradeArgs;
