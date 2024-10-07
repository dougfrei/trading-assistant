import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTradeAccount, IGqlTradeInstrument } from '@src/interfaces/IGqlResponses';
import { gql } from 'graphql-request';

const TRADE_ACCOUNTS_ROUTE_DATA_QUERY = gql`
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
	}
`;

export interface ITradeAccountsRouteData {
	tradeAccounts: IGqlTradeAccount[];
	tradeInstruments: IGqlTradeInstrument[];
}

export const loadTradeAccountsRouteData = async (): Promise<ITradeAccountsRouteData> => {
	const response = await executeGQLRequest<{
		tradeAccounts: IGqlTradeAccount[];
		tradeInstruments: IGqlTradeInstrument[];
	}>(TRADE_ACCOUNTS_ROUTE_DATA_QUERY);

	return {
		tradeAccounts: response?.tradeAccounts ?? [],
		tradeInstruments: response?.tradeInstruments ?? []
	};
};
