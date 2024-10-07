import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ETradeNoteType, TTradePosition } from '@trading-assistant/common';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { GraphQLJSON } from 'graphql-scalars';
import { Trade as TradeEntity } from 'src/entities/Trade.model';
import { TradePriceLevel } from 'src/graphql/trades/tradePriceLevel.model';
import { getTradeIsScratch, getTradePnL, getTradePnLPercent } from 'src/util/trade-positions';
import { TradeNote } from './tradeNote.model';

@ObjectType({ description: 'trade' })
export class Trade {
	@Field(() => Int)
	id: number;

	@Field()
	userId: number;

	@Field(() => Int)
	accountId: number;

	@Field(() => ETradeInstrumentType)
	instrumentType: ETradeInstrumentType;

	@Field()
	tickerSymbol: string;

	@Field(() => String)
	optionSpreadTemplate: string;

	@Field(() => [TradePriceLevel])
	stopLossLevels: TradePriceLevel[];

	@Field(() => [TradePriceLevel])
	profitTargetLevels: TradePriceLevel[];

	@Field(() => GraphQLJSON)
	positions: TTradePosition[];

	@Field(() => [TradeNote])
	notes: TradeNote[];

	@Field(() => Date, { nullable: true })
	openDateTime: Date | null;

	@Field(() => Date, { nullable: true })
	closeDateTime: Date | null;

	@Field(() => Float)
	pnl: number;

	@Field(() => Float)
	pnlPercent: number;

	@Field()
	isScratch: boolean;

	@Field()
	isClosed: boolean;

	@Field()
	isReviewed: boolean;

	static fromEntity(entity: TradeEntity): Trade {
		return {
			id: entity.id,
			userId: entity.userId,
			accountId: entity.accountId,
			instrumentType: entity.instrumentType,
			tickerSymbol: entity.tickerSymbol,
			optionSpreadTemplate: entity.optionSpreadTemplate,
			stopLossLevels: entity.stopLossLevels.map((level) => TradePriceLevel.fromObject(level)),
			profitTargetLevels: entity.profitTargetLevels.map((level) =>
				TradePriceLevel.fromObject(level)
			),
			positions: entity.positions,
			notes: entity.notes.map((note) => TradeNote.fromObject(note)),
			openDateTime: entity.openDateTime,
			closeDateTime: entity.closeDateTime ? new Date(entity.closeDateTime) : null,
			pnl: getTradePnL(entity.positions),
			pnlPercent: getTradePnLPercent(entity.instrumentType, entity.positions),
			isScratch: getTradeIsScratch(entity.positions),
			isClosed: entity.closeDateTime !== null,
			isReviewed: entity.notes.findIndex((note) => note.type === ETradeNoteType.REVIEW) !== -1
		};
	}
}
