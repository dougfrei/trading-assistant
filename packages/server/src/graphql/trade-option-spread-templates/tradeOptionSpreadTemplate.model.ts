import { Field, ObjectType } from '@nestjs/graphql';
import { IOptionSpreadTemplate } from 'src/constants/optionSpreadTemplates';
import { TradeOptionSpreadTemplateLeg } from './tradeOptionSpreadTemplateLeg.model';

@ObjectType({ description: 'option spread template' })
export class TradeOptionSpreadTemplate {
	@Field()
	name: string;

	@Field()
	label: string;

	@Field(() => [TradeOptionSpreadTemplateLeg])
	legs: TradeOptionSpreadTemplateLeg[];

	static fromObject(obj: IOptionSpreadTemplate) {
		return {
			name: obj.name,
			label: obj.label,
			legs: obj.legs.map((leg) => TradeOptionSpreadTemplateLeg.fromObject(leg))
		};
	}
}
