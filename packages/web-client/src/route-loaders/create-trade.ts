import { executeGQLRequest } from '@src/graphql-request-client';
import {
	IGqlTradeAccount,
	IGqlTradeOptionSpreadTemplateGroup,
	IGqlTradeTag
} from '@src/interfaces/IGqlResponses';
import { gql } from 'graphql-request';

const CREATE_TRADE_ROUTE_DATA_QUERY = gql`
	query {
		tradeAccounts {
			id
			label
			instruments {
				name
				label
			}
		}
		tradeOptionSpreadTemplateGroups {
			groupName
			templates {
				name
				label
				legs {
					type
					strikeGroup
					expirationGroup
					quantity
					quantityMultiplier
					editableFields
					compareWithPreviousLeg {
						strike
						expiration
					}
				}
			}
		}
		tradeTags(type: SETUP) {
			id
			type
			label
		}
	}
`;

export interface ICreateTradeRouteData {
	tradeAccounts: IGqlTradeAccount[];
	tradeOptionSpreadTemplateGroups: IGqlTradeOptionSpreadTemplateGroup[];
	tradeTags: IGqlTradeTag[];
}

export const loadCreateTradeRouteData = async (): Promise<ICreateTradeRouteData> => {
	const response = await executeGQLRequest<{
		tradeAccounts: IGqlTradeAccount[];
		tradeOptionSpreadTemplateGroups: IGqlTradeOptionSpreadTemplateGroup[];
		tradeTags: IGqlTradeTag[];
	}>(CREATE_TRADE_ROUTE_DATA_QUERY);

	return {
		tradeAccounts: response?.tradeAccounts ?? [],
		tradeOptionSpreadTemplateGroups: response?.tradeOptionSpreadTemplateGroups ?? [],
		tradeTags: response?.tradeTags
	};
};
