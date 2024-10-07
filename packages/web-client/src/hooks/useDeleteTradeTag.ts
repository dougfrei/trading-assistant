import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useCallback } from 'react';

const DELETE_TRADE_TAG = gql`
	mutation DeleteTradeTag($tagId: Int!) {
		deleteTradeTag(tagId: $tagId) {
			id
		}
	}
`;

function useDeleteTradeTag(onSuccess: (deletedTagId: number) => void) {
	const { mutate, error, isPending, reset } = useMutation({
		mutationFn: async (tagId: number) => {
			const result = await executeGQLRequest<{ deleteTradeTag: IGqlTradeTag }>(
				DELETE_TRADE_TAG,
				{
					tagId
				}
			);

			return result.deleteTradeTag.id;
		},
		onSuccess
	});

	const deleteTradeTag = useCallback(
		(tagId: number) => {
			mutate(tagId);
		},
		[mutate]
	);

	return {
		deleteTradeTag,
		isDeletingTradeTag: isPending,
		deleteTradeTagError: error ?? null,
		resetDeleteTradeTagStatus: reset
	};
}

export default useDeleteTradeTag;
