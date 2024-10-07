import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTradeAccount, IGqlTradeInstrument } from '@src/interfaces/IGqlResponses';
import { gql } from 'graphql-request';

const TRADE_CALENDAR_ROUTE_DATA_QUERY = gql`
	query {
		tradeAccounts {
			id
			label
			instruments {
				name
				label
			}
		}
		tradeInstruments {
			name
			label
		}
	}
`;

export interface ITradeCalendarRouteData {
	tradeAccounts: IGqlTradeAccount[];
	tradeInstruments: IGqlTradeInstrument[];
}

export const loadTradeCalendarRouteData = async (): Promise<ITradeCalendarRouteData> => {
	const response = await executeGQLRequest<{
		tradeAccounts: IGqlTradeAccount[];
		tradeInstruments: IGqlTradeInstrument[];
	}>(TRADE_CALENDAR_ROUTE_DATA_QUERY);

	return {
		tradeAccounts: response?.tradeAccounts ?? [],
		tradeInstruments: response?.tradeInstruments ?? []
	};
};
