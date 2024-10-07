import { nanoid } from 'nanoid';
import * as v from 'valibot';

interface ITradePriceLevel {
	id: string;
	value: number;
	notes: string;
}

export const tradePriceLevelSchema = v.object({
	id: v.optional(v.string(), nanoid()),
	value: v.pipe(v.number(), v.minValue(0), v.finite()),
	notes: v.string()
});

export default ITradePriceLevel;
