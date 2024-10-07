import { executeGQLRequest } from '@src/graphql-request-client';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { IGqlTradeInstrument } from '../interfaces/IGqlResponses';

const GET_TRADE_INSTRUMENTS_QUERY = gql`
	query {
		tradeInstruments {
			name
			label
		}
	}
`;

function useGetTradeInstruments() {
	const { data, isLoading, error } = useQuery({
		queryKey: ['trade-instruments'],
		queryFn: async () => {
			const response = await executeGQLRequest<{ tradeInstruments: IGqlTradeInstrument[] }>(
				GET_TRADE_INSTRUMENTS_QUERY
			);

			return response.tradeInstruments;
		}
	});

	return {
		tradeInstruments: data ?? [],
		loading: isLoading,
		error
	};
}

export default useGetTradeInstruments;
