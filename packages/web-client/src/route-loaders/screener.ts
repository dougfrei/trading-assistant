import { executeGQLRequest } from '@src/graphql-request-client';
import {
	IGqlCandleAnalyzerAlertType,
	IGqlScreenerQuery,
	IGqlScreenerSortMethod,
	IGqlSector
} from '@src/interfaces/IGqlResponses';
import { gql } from 'graphql-request';

const SCREENER_ROUTE_DATA_QUERY = gql`
	query {
		screenerQueries {
			id
			label
			description
		}
		screenerSortMethods {
			name
			label
		}
		candleAnalyzerAlertTypes {
			key
			label
			sentiment
		}
		sectors {
			name
			gcis
		}
	}
`;

export interface IScreenerRouteData {
	screenerQueries: IGqlScreenerQuery[];
	sortMethods: IGqlScreenerSortMethod[];
	candleAnalyzerAlertTypes: IGqlCandleAnalyzerAlertType[];
	sectors: IGqlSector[];
}

export const loadScreenerRouteData = async (): Promise<IScreenerRouteData> => {
	const response = await executeGQLRequest<{
		screenerQueries: IGqlScreenerQuery[];
		screenerSortMethods: IGqlScreenerSortMethod[];
		candleAnalyzerAlertTypes: IGqlCandleAnalyzerAlertType[];
		sectors: IGqlSector[];
	}>(SCREENER_ROUTE_DATA_QUERY);

	return {
		screenerQueries: response?.screenerQueries ?? [],
		sortMethods: response?.screenerSortMethods ?? [],
		candleAnalyzerAlertTypes: response?.candleAnalyzerAlertTypes ?? [],
		sectors: response?.sectors ?? []
	};
};
