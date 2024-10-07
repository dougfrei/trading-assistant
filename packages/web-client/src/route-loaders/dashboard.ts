import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTickerSymbolNews } from '@src/interfaces/IGqlResponses';
import { gql } from 'graphql-request';

const DASHBOARD_ROUTE_DATA_QUERY = gql`
	query GetTickerSymbolNews {
		tickerSymbolNews {
			id
			publisher {
				name
				homepageURL
				logoURL
				faviconURL
			}
			title
			author
			publishedUTC
			articleURL
			tickers
			imageURL
			description
			keywords
			insights {
				ticker
				sentiment
				sentimentReasoning
			}
		}
	}
`;

export const loadDashboardRouteData = async (): Promise<IGqlTickerSymbolNews[]> => {
	const response = await executeGQLRequest<{ tickerSymbolNews: IGqlTickerSymbolNews[] }>(
		DASHBOARD_ROUTE_DATA_QUERY
	);

	return response?.tickerSymbolNews ?? [];
};
