import { executeGQLRequest } from '@src/graphql-request-client';
import {
	IGqlTradeAccount,
	IGqlTradeInstrument,
	IGqlTradeOptionSpreadTemplateGroup,
	IGqlTradeTag
} from '@src/interfaces/IGqlResponses';
import { ETradeTagType } from '@trading-assistant/common/enums';
import { gql } from 'graphql-request';

const TRADES_LIST_ROUTE_DATA_QUERY = gql`
	query {
		tradeAccounts {
			id
			label
			userId
			supportedInstruments
		}
		tradeInstruments {
			name
			label
		}
		tradeOptionSpreadTemplateGroups {
			groupName
			templates {
				name
				label
			}
		}
		tradeTags {
			id
			label
			type
		}
	}
`;

export interface ITradesListRouteData {
	tradeAccounts: IGqlTradeAccount[];
	tradeInstruments: IGqlTradeInstrument[];
	tradeOptionSpreadTemplateGroups: IGqlTradeOptionSpreadTemplateGroup[];
	tradeTags: IGqlTradeTag[];
	reviewTradeTags: IGqlTradeTag[];
}

export const loadTradesListRouteData = async () // client: ApolloClient<object>
: Promise<ITradesListRouteData> => {
	const response = await executeGQLRequest<{
		tradeAccounts: IGqlTradeAccount[];
		tradeInstruments: IGqlTradeInstrument[];
		tradeOptionSpreadTemplateGroups: IGqlTradeOptionSpreadTemplateGroup[];
		tradeTags: IGqlTradeTag[];
	}>(TRADES_LIST_ROUTE_DATA_QUERY);

	return {
		tradeAccounts: response?.tradeAccounts ?? [],
		tradeInstruments: response?.tradeInstruments ?? [],
		tradeOptionSpreadTemplateGroups: response?.tradeOptionSpreadTemplateGroups ?? [],
		tradeTags: response?.tradeTags ?? [],
		reviewTradeTags:
			response?.tradeTags.filter((tag) => tag.type === ETradeTagType.REVIEW) ?? []
	};
};
