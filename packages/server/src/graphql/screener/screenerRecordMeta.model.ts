import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'screener record meta' })
export class ScreenerRecordMeta {
	@Field(() => Float)
	change: number;
}
