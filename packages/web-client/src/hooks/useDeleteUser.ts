import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlUser } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useCallback } from 'react';

const DELETE_USER_MUTATION = gql`
	mutation DeleteUser($id: Int!) {
		deleteUser(id: $id) {
			id
		}
	}
`;

function useDeleteUser(onSuccess: (deletedUser: IGqlUser) => void) {
	const { mutate, error, isPending, reset } = useMutation({
		mutationFn: async (id: number) => {
			const result = await executeGQLRequest<{ deleteUser: IGqlUser }>(DELETE_USER_MUTATION, {
				id
			});

			return result.deleteUser;
		},
		onSuccess
	});

	const deleteUser = useCallback((userId: number) => mutate(userId), [mutate]);

	return {
		deleteUser,
		isDeletingUser: isPending,
		deleteUserError: error ?? null,
		resetDeleteUserMutation: reset
	};
}

export default useDeleteUser;
