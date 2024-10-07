import { ECandlePeriodType } from '@trading-assistant/common';
import { valibotSchemas } from 'src/util/valibot';
import * as v from 'valibot';

interface ICandleDTO {
	tickerSymbol: string;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	period: Date;
	periodType: ECandlePeriodType;
}

export const validCandleDTO = v.object({
	tickerSymbol: valibotSchemas.nonEmptyString('ticker symbol is empty'),
	open: v.pipe(v.number(), v.finite(), v.minValue(0)),
	high: v.pipe(v.number(), v.finite(), v.minValue(0)),
	low: v.pipe(v.number(), v.finite(), v.minValue(0)),
	close: v.pipe(v.number(), v.finite(), v.minValue(0)),
	volume: v.pipe(v.number(), v.integer(), v.finite(), v.minValue(0)),
	period: v.pipe(
		v.string(), // NOTE: the value will be a string if coming from a serialized object, such as the Redis cache
		v.transform((value) => new Date(value))
	),
	periodType: v.enum(ECandlePeriodType)
});

export default ICandleDTO;
