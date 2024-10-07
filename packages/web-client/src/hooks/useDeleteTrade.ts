import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTrade } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useCallback } from 'react';

const DELETE_TRADE = gql`
	mutation DeleteTrade($tradeId: Int!) {
		deleteTrade(tradeId: $tradeId) {
			id
		}
	}
`;

function useDeleteTrade(onSuccess: (deletedTradeId: number) => void) {
	const { mutate, error, isPending, reset } = useMutation({
		mutationFn: async (tradeId: number) => {
			const result = await executeGQLRequest<{ deleteTrade: IGqlTrade }>(DELETE_TRADE, {
				tradeId
			});

			return result.deleteTrade.id;
		},
		onSuccess
	});

	const deleteTrade = useCallback((tradeId: number) => mutate(tradeId), [mutate]);

	return {
		deleteTrade,
		isDeletingTrade: isPending,
		deleteTradeError: error ?? null,
		resetDeleteTradeStatus: reset
	};
}

export default useDeleteTrade;
