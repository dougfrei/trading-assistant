import { ArgsType, Field } from '@nestjs/graphql';
import { passwordSchema } from '@trading-assistant/common';
import * as v from 'valibot';

@ArgsType()
class ChangeUserPasswordArgs {
	@Field(() => String)
	currentPassword: string;

	@Field(() => String)
	newPassword: string;

	static schema = v.object({
		currentPassword: v.pipe(
			v.string('currentPassword is a required argument'),
			v.trim(),
			v.minLength(1)
		),
		newPassword: passwordSchema('newPassword is a required argument', 'New password')
	});
}

export default ChangeUserPasswordArgs;
