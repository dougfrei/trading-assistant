import { Field, ObjectType } from '@nestjs/graphql';
import ITradeNote, { tradeNoteSchema } from 'src/interfaces/ITradeNote';
import * as v from 'valibot';

@ObjectType({ description: 'trade note' })
export class TradeNote {
	@Field()
	id: string;

	@Field()
	timestamp: number;

	@Field()
	type: string;

	@Field()
	content: string;

	static fromObject(obj: ITradeNote): TradeNote {
		v.parse(tradeNoteSchema, obj);

		return {
			id: obj.id,
			timestamp: obj.timestamp,
			type: obj.type,
			content: obj.content
		};
	}
}
