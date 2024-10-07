import { ArgsType, Field } from '@nestjs/graphql';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { ArrayNotEmpty, ArrayUnique } from 'class-validator';

@ArgsType()
class CreateTradeAccountArgs {
	@Field(() => String)
	label: string;

	@ArrayNotEmpty()
	@ArrayUnique()
	@Field(() => [ETradeInstrumentType])
	supportedInstruments: ETradeInstrumentType[];
}

export default CreateTradeAccountArgs;
