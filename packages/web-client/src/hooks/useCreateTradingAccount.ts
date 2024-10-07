import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTradeAccount } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';
import { gql } from 'graphql-request';
import { useCallback } from 'react';

const CREATE_TRADE_ACCOUNT_MUTATION = gql`
	mutation CreateTradeAccount($label: String!, $supportedInstruments: [ETradeInstrumentType!]!) {
		createTradeAccount(label: $label, supportedInstruments: $supportedInstruments) {
			id
			label
			supportedInstruments
			instruments {
				label
				name
			}
		}
	}
`;

function useCreateTradeAccount(onSuccess: (account: IGqlTradeAccount) => void) {
	const { mutate, error, isPending } = useMutation({
		mutationFn: async ({
			label,
			supportedInstruments
		}: {
			label: string;
			supportedInstruments: ETradeInstrumentType[];
		}) => {
			const result = await executeGQLRequest<{ createTradeAccount: IGqlTradeAccount }>(
				CREATE_TRADE_ACCOUNT_MUTATION,
				{
					label,
					supportedInstruments
				}
			);

			return result.createTradeAccount;
		},
		onSuccess
	});

	const createTradeAccount = useCallback(
		({
			label,
			supportedInstruments
		}: {
			label: string;
			supportedInstruments: ETradeInstrumentType[];
		}) => {
			mutate({ label, supportedInstruments });
		},
		[mutate]
	);

	return {
		createTradeAccount,
		isCreatingTradeAccount: isPending,
		createTradeAccountError: error
	};
}

export default useCreateTradeAccount;
