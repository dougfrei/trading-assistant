import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ETradeOptionType } from '@trading-assistant/common';
import { IOptionSpreadTemplateLeg } from 'src/constants/optionSpreadTemplates';
import { TradeOptionSpreadTemplateLegCompare } from './tradeOptionSpreadTemplateLegCompare.model';

@ObjectType({ description: 'option spread template leg' })
export class TradeOptionSpreadTemplateLeg {
	@Field(() => ETradeOptionType)
	type: ETradeOptionType;

	@Field(() => Int)
	strikeGroup: number;

	@Field(() => Int)
	expirationGroup: number;

	@Field(() => Int)
	quantity: number;

	@Field(() => Int)
	quantityMultiplier: number;

	@Field(() => [String])
	editableFields: string[];

	@Field(() => TradeOptionSpreadTemplateLegCompare)
	compareWithPreviousLeg: TradeOptionSpreadTemplateLegCompare;

	static fromObject(obj: IOptionSpreadTemplateLeg): TradeOptionSpreadTemplateLeg {
		return {
			type: obj.type,
			strikeGroup: obj.strike_group,
			expirationGroup: obj.exp_group,
			quantity: obj.quantity,
			quantityMultiplier: obj.quantity_multiplier,
			editableFields: obj.editable_fields,
			compareWithPreviousLeg: TradeOptionSpreadTemplateLegCompare.fromObject(
				obj.compare_with_prev_leg ?? {}
			)
		};
	}
}
