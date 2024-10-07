import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useCallback } from 'react';

const UPDATE_TRADE_TAG_MUTATION = gql`
	mutation UpdateTradeTag($id: Int!, $label: String, $type: ETradeTagType) {
		updateTradeTag(id: $id, label: $label, type: $type) {
			id
			label
			type
		}
	}
`;

function useUpdateTradeTag(onSuccess: (updatedTag: IGqlTradeTag) => void) {
	const { mutate, error, isPending, reset } = useMutation({
		mutationFn: async (variables: Partial<IGqlTradeTag>) => {
			const result = await executeGQLRequest<{ updateTradeTag: IGqlTradeTag }>(
				UPDATE_TRADE_TAG_MUTATION,
				variables
			);

			return result.updateTradeTag;
		},
		onSuccess
	});

	const updateTradeTag = useCallback(
		(tagId: number, params: Partial<Omit<IGqlTradeTag, 'id'>>) => {
			mutate({
				id: tagId,
				...params
			});
		},
		[mutate]
	);

	return {
		updateTradeTag,
		isUpdatingTradeTag: isPending,
		updateTradeTagError: error ?? null,
		resetUpdateTradeTagStatus: reset
	};
}

export default useUpdateTradeTag;
