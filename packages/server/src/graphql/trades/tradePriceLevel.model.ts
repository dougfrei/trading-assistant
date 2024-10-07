import { Field, Float, ObjectType } from '@nestjs/graphql';
import ITradePriceLevel, { tradePriceLevelSchema } from 'src/interfaces/ITradePriceLevel';
import * as v from 'valibot';

@ObjectType({ description: 'trade price level' })
export class TradePriceLevel {
	@Field()
	id: string;

	@Field(() => Float)
	value: number;

	@Field({ defaultValue: '' })
	notes?: string;

	static fromObject(obj: ITradePriceLevel): TradePriceLevel {
		v.parse(tradePriceLevelSchema, obj);

		return {
			id: obj.id,
			value: obj.value,
			notes: obj.notes
		};
	}
}
