import { ArgsType, Field, Int } from '@nestjs/graphql';
import { ETradeInstrumentType } from '@trading-assistant/common';

@ArgsType()
class UpdateTradeAccountArgs {
	@Field(() => Int)
	id: number;

	@Field(() => String, { nullable: true })
	label?: string;

	@Field(() => [ETradeInstrumentType], { nullable: true })
	supportedInstruments?: ETradeInstrumentType[];
}

export default UpdateTradeAccountArgs;
