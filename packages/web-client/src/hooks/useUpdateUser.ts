import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlUser } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useCallback } from 'react';

const UPDATE_USER_MUTATION = gql`
	mutation UpdateUser($id: Int, $displayName: String, $roles: [String!]) {
		updateUser(id: $id, displayName: $displayName, roles: $roles) {
			id
			username
			roles
			displayName
			createdAt
		}
	}
`;

function useUpdateUser(onSuccess: (updatedUser: IGqlUser) => void) {
	const { mutate, error, isPending, reset } = useMutation({
		mutationFn: async (variables: Partial<IGqlUser>) => {
			const result = await executeGQLRequest<{ updateUser: IGqlUser }>(
				UPDATE_USER_MUTATION,
				variables
			);

			return result.updateUser;
		},
		onSuccess
	});

	const updateUser = useCallback(
		(userId: number, params: Partial<Omit<IGqlUser, 'id'>>) => {
			mutate({
				id: userId,
				...params
			});
		},
		[mutate]
	);

	const updateCurrentUser = useCallback(
		(params: Partial<Omit<IGqlUser, 'id'>>) => {
			mutate(params);
		},
		[mutate]
	);

	return {
		updateUser,
		updateCurrentUser,
		isUpdatingUser: isPending,
		updateUserError: error ?? null,
		resetUpdateUser: reset
	};
}

export default useUpdateUser;
