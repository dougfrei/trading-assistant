import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
class DeleteUserArgs {
	@Field(() => Int)
	id?: number;
}

export default DeleteUserArgs;
