import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ECandlePeriodType } from '@trading-assistant/common';
import { GraphQLJSON } from 'graphql-scalars';
import { Candle as CandleEntity } from 'src/entities/Candle.model';

@ObjectType({ description: 'candle' })
export class Candle {
	@Field()
	id: number;

	@Field()
	tickerSymbolId: number;

	@Field()
	period: number;

	@Field(() => ECandlePeriodType)
	periodType: ECandlePeriodType;

	@Field()
	open: number;

	@Field()
	high: number;

	@Field()
	low: number;

	@Field()
	close: number;

	@Field(() => Int)
	volume: number;

	@Field(() => GraphQLJSON)
	indicators: Record<string, number | null>;

	@Field(() => [String])
	alerts: string[];

	static fromEntity(candle: CandleEntity): Candle {
		return {
			id: candle.id,
			tickerSymbolId: candle.tickerSymbolId,
			period: candle.period.getTime(),
			periodType: candle.periodType,
			open: candle.open,
			high: candle.high,
			low: candle.low,
			close: candle.close,
			volume: candle.volume,
			indicators: Object.fromEntries(candle.indicators),
			alerts: Array.from(candle.alerts)
		};
	}
}
