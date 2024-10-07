import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useCallback } from 'react';

const CREATE_TRADE_TAG = gql`
	mutation CreateTradeTag($type: ETradeTagType!, $label: String!) {
		createTradeTag(type: $type, label: $label) {
			id
			type
			label
		}
	}
`;

function useCreateTradeTag(onSuccess: (updatedTag: IGqlTradeTag) => void) {
	const { mutate, error, isPending, reset } = useMutation({
		mutationFn: async (variables: Omit<IGqlTradeTag, 'id'>) => {
			const result = await executeGQLRequest<{ updateTradeTag: IGqlTradeTag }>(
				CREATE_TRADE_TAG,
				variables
			);

			return result.updateTradeTag;
		},
		onSuccess
	});

	const createTradeTag = useCallback(
		(params: Omit<IGqlTradeTag, 'id'>) => {
			mutate(params);
		},
		[mutate]
	);

	return {
		createTradeTag,
		isCreatingTradeTag: isPending,
		createTradeTagError: error ?? null,
		resetCreateTradeTagStatus: reset
	};
}

export default useCreateTradeTag;
