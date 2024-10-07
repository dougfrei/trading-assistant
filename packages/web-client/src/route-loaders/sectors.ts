import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlSector } from '@src/interfaces/IGqlResponses';
import { gql } from 'graphql-request';

const SECTORS_ROUTE_DATA_QUERY = gql`
	query GetSectors {
		sectors {
			name
			gcis
			etfTickerSymbol {
				name
				candles(periodCount: 50) {
					period
					open
					high
					low
					close
					volume
					indicators
				}
			}
		}
	}
`;

export const loadSectorsRouteData = async (): Promise<IGqlSector[]> => {
	const response = await executeGQLRequest<{ sectors: IGqlSector[] }>(SECTORS_ROUTE_DATA_QUERY);

	return response?.sectors ?? [];
};
