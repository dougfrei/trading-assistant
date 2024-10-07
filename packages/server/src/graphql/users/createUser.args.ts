import { ArgsType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import * as v from 'valibot';

@ArgsType()
class CreateUserArgs {
	@IsEmail({}, { message: 'Username must be a valid email address' })
	@Field(() => String)
	username: string;

	@Field(() => String, { defaultValue: '' })
	displayName: string;

	@Field(() => [String], { defaultValue: [] })
	roles: string[];

	static schema = v.object({
		username: v.pipe(v.string(), v.email('Username must be a valid email address')),
		displayName: v.optional(v.pipe(v.string(), v.trim()), ''),
		roles: v.optional(v.array(v.pipe(v.string(), v.trim(), v.minLength(1))), [])
	});
}

export default CreateUserArgs;
