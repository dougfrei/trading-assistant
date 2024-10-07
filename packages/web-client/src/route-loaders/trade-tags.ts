import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { gql } from 'graphql-request';

const TRADE_TAGS_ROUTE_DATA_QUERY = gql`
	query {
		tradeTags {
			id
			label
			type
		}
	}
`;

export const loadTradeTagsRouteData = async (): Promise<IGqlTradeTag[]> => {
	const response = await executeGQLRequest<{ tradeTags: IGqlTradeTag[] }>(
		TRADE_TAGS_ROUTE_DATA_QUERY
	);

	return response?.tradeTags ?? [];
};
