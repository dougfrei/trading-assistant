import { Field, ObjectType } from '@nestjs/graphql';
import { IScreenerQueryLogicRoot } from '@trading-assistant/common';
import { GraphQLJSON } from 'graphql-scalars';
import { ScreenerQuery as ScreenerQueryEntity } from 'src/entities/ScreenerQuery.model';

@ObjectType({ description: 'screener query' })
export class ScreenerQuery {
	@Field()
	id: number;

	@Field()
	label: string;

	@Field({ defaultValue: '' })
	description?: string;

	@Field(() => GraphQLJSON)
	query: IScreenerQueryLogicRoot | null;

	static fromEntity(entity: ScreenerQueryEntity): ScreenerQuery {
		return {
			id: entity.id,
			label: entity.label,
			description: entity.description,
			query: entity.query
		};
	}
}
