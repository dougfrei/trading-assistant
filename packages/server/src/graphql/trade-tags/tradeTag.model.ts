import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ETradeTagType } from '@trading-assistant/common';
import { TradeTag as TradeTagEntity } from 'src/entities/TradeTag.model';

@ObjectType({ description: 'trade tag' })
export class TradeTag {
	@Field(() => Int)
	id: number;

	@Field(() => Int)
	userId: number;

	@Field(() => ETradeTagType)
	type: ETradeTagType;

	@Field()
	label: string;

	static fromEntity(entity: TradeTagEntity): TradeTag {
		return {
			id: entity.id,
			userId: entity.userId,
			type: entity.type,
			label: entity.label
		};
	}
}
