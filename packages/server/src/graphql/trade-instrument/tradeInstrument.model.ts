import { Field, ObjectType } from '@nestjs/graphql';
import { ITradeInstrument } from 'src/constants/tradeInstruments';

@ObjectType({ description: 'trade instrument' })
export class TradeInstrument {
	@Field()
	name: string;

	@Field()
	label: string;

	static fromObject(obj: ITradeInstrument): TradeInstrument {
		return {
			name: obj.name,
			label: obj.label
		};
	}
}
