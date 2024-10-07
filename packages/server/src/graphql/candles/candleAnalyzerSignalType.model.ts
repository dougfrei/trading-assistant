import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'candle analyzer signal type' })
export class CandleAnalyzerSignalType {
	@Field()
	key: string;

	@Field()
	type: string;

	@Field()
	message: string;
}
