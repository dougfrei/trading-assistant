import { Field, ObjectType } from '@nestjs/graphql';
import { Candle } from 'src/graphql/candles/candle.model';
import { TickerSymbol } from 'src/graphql/ticker-symbols/ticker.model';
import { ScreenerRecordMeta } from './screenerRecordMeta.model';

@ObjectType({ description: 'screener record' })
export class ScreenerRecord {
	@Field(() => TickerSymbol)
	tickerSymbol: TickerSymbol;

	@Field(() => Candle)
	lastCandle: Candle;

	@Field()
	meta: ScreenerRecordMeta;
}
