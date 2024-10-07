import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
class AddTradeReviewArgs {
	@Field(() => Int)
	id: number;

	@Field(() => String)
	reviewContent: string;

	@Field(() => [Int], { nullable: true })
	tagIds?: number[];
}

export default AddTradeReviewArgs;
