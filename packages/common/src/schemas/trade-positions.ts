import { nanoid } from 'nanoid';
import { decodeOptionName } from '../util/option-naming';
import * as v from 'valibot';

export const stockTradePositionSchema = v.object({
	id: v.optional(v.string(), nanoid()),
	dateTime: v.string(),
	totalAmount: v.pipe(
		v.number(),
		v.finite(),
		v.check((value) => Math.abs(value) !== 0, 'totalAmount cannot be zero')
	),
	fees: v.optional(v.pipe(v.number(), v.finite(), v.minValue(0)), 0),
	notes: v.optional(v.string(), ''),
	quantity: v.pipe(v.number(), v.integer(), v.finite())
});

export const optionTradePositionSchema = v.object({
	id: v.optional(v.string(), nanoid()),
	dateTime: v.string(),
	totalAmount: v.pipe(
		v.number(),
		v.finite(),
		v.check((value) => Math.abs(value) !== 0, 'totalAmount cannot be zero')
	),
	fees: v.optional(v.pipe(v.number(), v.finite(), v.minValue(0)), 0),
	notes: v.optional(v.string(), ''),
	optionLegs: v.pipe(
		v.array(
			v.object({
				name: v.pipe(
					v.string(),
					v.check((value) => {
						try {
							decodeOptionName(value);
						} catch {
							return false;
						}

						return true;
					}, 'Invalid option name')
				),
				quantity: v.pipe(v.number(), v.integer(), v.finite())
			})
		),
		v.minLength(1)
	)
});
