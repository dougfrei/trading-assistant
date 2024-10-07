import { ArgsType, Field } from '@nestjs/graphql';
import { ETradeTagType } from '@trading-assistant/common';
import { MinLength } from 'class-validator';

@ArgsType()
class CreateTradeTagArgs {
	@MinLength(1)
	@Field(() => String)
	label: string;

	@Field(() => ETradeTagType)
	type: ETradeTagType;
}

export default CreateTradeTagArgs;
