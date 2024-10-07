import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlUserRoleType } from '@src/interfaces/IGqlResponses';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

interface IGqlGetUserRoleTypesResponse {
	userRoleTypes: IGqlUserRoleType[];
}

const GET_USER_ROLE_TYPES_QUERY = gql`
	query {
		userRoleTypes {
			name
			label
			description
		}
	}
`;

function useUserRoleTypes() {
	const { data, isLoading, error } = useQuery({
		queryKey: ['user-role-types'],
		queryFn: async () => {
			const response =
				await executeGQLRequest<IGqlGetUserRoleTypesResponse>(GET_USER_ROLE_TYPES_QUERY);

			return response.userRoleTypes;
		}
	});

	return {
		userRoleTypes: Array.isArray(data) ? data : [],
		isLoadingUserRoleTypes: isLoading,
		userRoleTypesError: error
	};
}

export default useUserRoleTypes;
