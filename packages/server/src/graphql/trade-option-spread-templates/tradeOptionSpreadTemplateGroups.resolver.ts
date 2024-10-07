import { Query, Resolver } from '@nestjs/graphql';
import { optionSpreadTemplateGroups } from 'src/constants/optionSpreadTemplates';
import { TradeOptionSpreadTemplateGroup } from './tradeOptionSpreadTemplateGroup.model';

@Resolver(() => TradeOptionSpreadTemplateGroup)
export class TradeOptionSpreadTemplateGroupResolver {
	@Query(() => [TradeOptionSpreadTemplateGroup])
	async tradeOptionSpreadTemplateGroups(): Promise<TradeOptionSpreadTemplateGroup[]> {
		return optionSpreadTemplateGroups.map((group) =>
			TradeOptionSpreadTemplateGroup.fromObject(group)
		);
	}
}
