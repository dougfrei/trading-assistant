import { Field, ObjectType } from '@nestjs/graphql';
import { ETickerSymbolType } from '@trading-assistant/common';
import { GraphQLBigInt } from 'graphql-scalars';
import { TickerSymbol as TickerSymbolEntity } from 'src/entities/TickerSymbol.model';

@ObjectType({ description: 'ticker symbol' })
export class TickerSymbol {
	@Field()
	id: number;

	@Field()
	name: string;

	@Field({ defaultValue: '' })
	label: string;

	@Field(() => ETickerSymbolType)
	type: ETickerSymbolType;

	@Field()
	gcis: string;

	@Field()
	averageDailyVolume: number;

	@Field(() => GraphQLBigInt)
	marketCap: bigint | null;

	static fromEntity(entity: TickerSymbolEntity): TickerSymbol {
		return {
			id: entity.id,
			name: entity.name,
			label: entity.label,
			type: entity.type,
			gcis: entity.gcis,
			averageDailyVolume: entity.avgDailyVol,
			marketCap: entity.marketCap
		};
	}
}
