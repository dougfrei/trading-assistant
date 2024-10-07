import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { TradeAccount as TradeAccountEntity } from 'src/entities/TradeAccount.model';

@ObjectType({ description: 'trade account' })
export class TradeAccount {
	@Field(() => Int)
	id: number;

	@Field(() => Int)
	userId: number;

	@Field()
	label: string;

	@Field(() => [ETradeInstrumentType])
	supportedInstruments: ETradeInstrumentType[];

	static fromEntity(entity: TradeAccountEntity): TradeAccount {
		return {
			id: entity.id,
			userId: entity.userId,
			label: entity.label,
			supportedInstruments: entity.supportedInstruments
		};
	}
}
