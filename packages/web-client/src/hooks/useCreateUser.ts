import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlUser } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useCallback } from 'react';

const CREATE_USER_MUTATION = gql`
	mutation CreateUser($username: String!, $displayName: String, $roles: [String!]) {
		createUser(username: $username, displayName: $displayName, roles: $roles) {
			id
			username
			displayName
			roles
			createdAt
			active
		}
	}
`;

type TCreateUserParams = Omit<Partial<IGqlUser>, 'id' | 'active' | 'createdAt' | 'isAdmin'>;

function useCreateUser(onSuccess: (createdUser: IGqlUser) => void) {
	const { mutate, error, isPending, reset } = useMutation({
		mutationFn: async (variables: TCreateUserParams) => {
			const result = await executeGQLRequest<{ createUser: IGqlUser }>(
				CREATE_USER_MUTATION,
				variables
			);

			return result.createUser;
		},
		onSuccess
	});

	const createUser = useCallback(
		(params: TCreateUserParams) => {
			mutate(params);
		},
		[mutate]
	);

	return {
		createUser,
		isCreatingUser: isPending,
		createUserError: error ?? null,
		resetCreateUserStatus: reset
	};
}

export default useCreateUser;
