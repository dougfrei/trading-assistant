import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'screener sort method' })
export class ScreenerSortMethod {
	@Field()
	name: string;

	@Field()
	label: string;
}
