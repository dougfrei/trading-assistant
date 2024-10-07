import { ArgsType, Field, Int } from '@nestjs/graphql';
import * as v from 'valibot';

@ArgsType()
class UpdateUserArgs {
	@Field(() => Int, { nullable: true })
	id?: number;

	@Field(() => String, { nullable: true })
	displayName?: string;

	@Field(() => [String], { nullable: true })
	roles?: string[];

	@Field({ nullable: true })
	active?: boolean;

	static schema = v.object({
		id: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1)), undefined),
		displayName: v.optional(v.pipe(v.string(), v.trim()), undefined),
		roles: v.optional(
			v.array(v.pipe(v.string(), v.trim(), v.minLength(1, 'Invalid role type'))),
			undefined
		),
		active: v.optional(v.boolean(), undefined)
	});
}

export default UpdateUserArgs;
