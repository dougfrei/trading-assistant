import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTradeAccount } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';
import { gql } from 'graphql-request';
import { useCallback } from 'react';

const UPDATE_TRADE_ACCOUNT_MUTATION = gql`
	mutation UpdateTradeAccount(
		$tradeAccountId: Int!
		$label: String
		$supportedInstruments: [ETradeInstrumentType!]
	) {
		updateTradeAccount(
			id: $tradeAccountId
			label: $label
			supportedInstruments: $supportedInstruments
		) {
			id
			label
			supportedInstruments
		}
	}
`;

interface IUpdateTradeAccountMutateVariables {
	tradeAccountId: number;
	label?: string;
	supportedInstruments?: ETradeInstrumentType[];
}

function useUpdateTradeAccount(onSuccess: (account: IGqlTradeAccount) => void) {
	const { mutate, error, isPending } = useMutation({
		mutationFn: async (variables: IUpdateTradeAccountMutateVariables) => {
			const result = await executeGQLRequest<{ updateTradeAccount: IGqlTradeAccount }>(
				UPDATE_TRADE_ACCOUNT_MUTATION,
				variables
			);

			return result.updateTradeAccount;
		},
		onSuccess
	});

	const updateTradeAccount = useCallback(
		(
			tradeAccountId: number,
			params: Omit<IUpdateTradeAccountMutateVariables, 'tradeAccountId'>
		) => {
			mutate({
				tradeAccountId,
				...params
			});
		},
		[mutate]
	);

	return {
		updateTradeAccount,
		isUpdatingTradeAccount: isPending,
		updateTradeAccountError: error
	};
}

export default useUpdateTradeAccount;
