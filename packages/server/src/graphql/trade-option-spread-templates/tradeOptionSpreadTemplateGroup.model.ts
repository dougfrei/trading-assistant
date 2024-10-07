import { Field, ObjectType } from '@nestjs/graphql';
import { IOptionSpreadTemplateGroup } from 'src/constants/optionSpreadTemplates';
import { TradeOptionSpreadTemplate } from './tradeOptionSpreadTemplate.model';

@ObjectType({ description: 'option spread template group' })
export class TradeOptionSpreadTemplateGroup {
	@Field()
	groupName: string;

	@Field(() => [TradeOptionSpreadTemplate])
	templates: TradeOptionSpreadTemplate[];

	static fromObject(obj: IOptionSpreadTemplateGroup) {
		return {
			groupName: obj.groupName,
			templates: obj.templates.map((tmpl) => TradeOptionSpreadTemplate.fromObject(tmpl))
		};
	}
}
