import { Field, Float, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { TickerSymbolEarnings as TickerSymbolEarningsEntity } from 'src/entities/TickerSymbolEarnings.model';

@ObjectType({ description: 'Ticker symbol earnings record' })
export class TickerSymbolEarnings {
	@Field()
	id: number;

	@Field()
	tickerSymbolId: number;

	@Field()
	afterClose: boolean;

	@Field()
	date: string;

	@Field(() => Float, { nullable: true })
	eps: number | null;

	@Field(() => Float, { nullable: true })
	epsEstimated: number | null;

	@Field()
	fiscalDateEnding: string;

	@Field(() => GraphQLBigInt, { nullable: true })
	revenue: bigint | null;

	@Field(() => GraphQLBigInt, { nullable: true })
	revenueEstimated: bigint | null;

	static fromEntity(entity: TickerSymbolEarningsEntity): TickerSymbolEarnings {
		return {
			id: entity.id,
			tickerSymbolId: entity.tickerSymbolId,
			afterClose: entity.afterClose,
			date: entity.date,
			eps: entity.eps,
			epsEstimated: entity.epsEstimated,
			fiscalDateEnding: entity.fiscalDateEnding,
			revenue: entity.revenue,
			revenueEstimated: entity.revenueEstimated
		};
	}
}
