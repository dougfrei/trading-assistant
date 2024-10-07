import { Field, ObjectType } from '@nestjs/graphql';
import {
	IOptionSpreadTemplateLegCompare,
	TOptionSpreadTemplateLegCompareLogic
} from 'src/constants/optionSpreadTemplates';

@ObjectType({ description: 'option spread template leg compare' })
export class TradeOptionSpreadTemplateLegCompare {
	@Field(() => String)
	strike: TOptionSpreadTemplateLegCompareLogic;

	@Field(() => String)
	expiration: TOptionSpreadTemplateLegCompareLogic;

	static fromObject(obj: IOptionSpreadTemplateLegCompare): TradeOptionSpreadTemplateLegCompare {
		return {
			strike: obj?.strike ?? '',
			expiration: obj?.expiration ?? ''
		};
	}
}
