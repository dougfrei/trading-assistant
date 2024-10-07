import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTradeAccount } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useCallback } from 'react';

const DELETE_TRADE_ACCOUNT_MUTATION = gql`
	mutation DeleteTradeAccount($tradeAccountId: Int!) {
		deleteTradeAccount(tradeAccountId: $tradeAccountId) {
			id
		}
	}
`;

function useDeleteTradeAccount(onSuccess: (deletedTradeAccount: IGqlTradeAccount) => void) {
	const { mutate, error, isPending, reset } = useMutation({
		mutationFn: async (tradeAccountId: number) => {
			const result = await executeGQLRequest<{ deleteTradeAccount: IGqlTradeAccount }>(
				DELETE_TRADE_ACCOUNT_MUTATION,
				{
					tradeAccountId
				}
			);

			return result.deleteTradeAccount;
		},
		onSuccess
	});

	const deleteTradeAccount = useCallback(
		(tradeAccountId: number) => mutate(tradeAccountId),
		[mutate]
	);

	return {
		deleteTradeAccount,
		isDeletingTradeAccount: isPending,
		deleteTradeAccountError: error ?? null,
		resetDeleteTradeAccountMutation: reset
	};
}

export default useDeleteTradeAccount;
