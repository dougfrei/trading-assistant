import { ArgsType, Field, Int } from '@nestjs/graphql';
import { ETradeTagType } from '@trading-assistant/common';

@ArgsType()
class UpdateTradeTagArgs {
	@Field(() => Int)
	id: number;

	@Field(() => String, { nullable: true })
	label?: string;

	@Field(() => ETradeTagType, { nullable: true })
	type?: ETradeTagType;
}

export default UpdateTradeTagArgs;
