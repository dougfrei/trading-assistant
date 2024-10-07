import { ArgsType, Field, Int } from '@nestjs/graphql';
import { TTradePosition } from '@trading-assistant/common';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { GraphQLJSON } from 'graphql-scalars';
import { TradePriceLevelInputType } from 'src/graphql/trades/tradePriceLevel.input';
import { TradeNoteInputType } from './tradeNote.input';

@ArgsType()
class UpdateTradeArgs {
	@Field(() => Int)
	id: number;

	@Field(() => Int, { nullable: true })
	accountId?: number;

	@Field(() => ETradeInstrumentType, { nullable: true })
	instrumentType?: ETradeInstrumentType;

	@Field(() => String, { nullable: true })
	tickerSymbol?: string;

	@Field(() => String, { nullable: true })
	optionSpreadTemplate?: string;

	@Field(() => [TradePriceLevelInputType], { nullable: true })
	stopLossLevels?: TradePriceLevelInputType[];

	@Field(() => [TradePriceLevelInputType], { nullable: true })
	profitTargetLevels?: TradePriceLevelInputType[];

	@Field(() => GraphQLJSON, { nullable: true })
	positions?: TTradePosition[];

	@Field(() => [Int], { nullable: true })
	tagIds?: number[];

	@Field(() => [TradeNoteInputType], { nullable: true })
	notes?: TradeNoteInputType[];
}

export default UpdateTradeArgs;
