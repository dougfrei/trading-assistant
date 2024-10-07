import { Field, ObjectType } from '@nestjs/graphql';
import { ECandlePeriodType } from '@trading-assistant/common';

@ObjectType({ description: 'AVWAP value' })
export class AVWAPValue {
	@Field()
	period: number;

	@Field(() => ECandlePeriodType)
	periodType: ECandlePeriodType;

	@Field()
	value: number;
}
