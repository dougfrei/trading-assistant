import { Field, Float, InputType } from '@nestjs/graphql';
import { nanoid } from 'nanoid';
import ITradePriceLevel from 'src/interfaces/ITradePriceLevel';

@InputType()
export class TradePriceLevelInputType {
	@Field(() => Float)
	value: number;

	@Field({ defaultValue: '' })
	notes: string;

	static toObject(record: TradePriceLevelInputType): ITradePriceLevel {
		return {
			id: nanoid(),
			value: record.value,
			notes: record.notes ?? ''
		};
	}
}
