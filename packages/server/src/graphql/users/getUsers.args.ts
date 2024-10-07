import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Min } from 'class-validator';

@ArgsType()
class GetUsersArgs {
	@Field(() => Int, { defaultValue: 1 })
	page: number;

	@Field(() => Int, { defaultValue: 25 })
	@Min(1)
	perPage: number;

	@Field({ defaultValue: '' })
	search: string;
}

export default GetUsersArgs;
