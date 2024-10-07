import { executeGQLRequest } from '@src/graphql-request-client';
import { useQuery } from '@tanstack/react-query';
import { TTradePosition } from '@trading-assistant/common/interfaces';
import { gql } from 'graphql-request';

const CALCULATE_TRADE_CLOSE_POSITION_QUERY = gql`
	query CalculateTradeClosePosition($tradeId: Int!) {
		calculateTradeClosePosition(tradeId: $tradeId)
	}
`;

function useCalculateTradeClosePosition(tradeId: number) {
	const { data, isLoading, error } = useQuery({
		queryKey: ['calculate-trade-close-position', tradeId],
		queryFn: async () => {
			if (!tradeId) {
				return null;
			}

			const response = await executeGQLRequest<{
				calculateTradeClosePosition: TTradePosition;
			}>(CALCULATE_TRADE_CLOSE_POSITION_QUERY, {
				tradeId
			});

			return response.calculateTradeClosePosition;
		}
	});

	return {
		isCalculatingTradeClosePosition: isLoading,
		calculateTradeClosePositionError: error,
		tradeClosePosition: data
	};
}

export default useCalculateTradeClosePosition;
