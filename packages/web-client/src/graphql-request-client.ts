import { GraphQLClient, RequestDocument } from 'graphql-request';
import { getApiUrl } from './util';
import { getAccessToken, setAccessToken } from './util/accessToken';

export const EVENT_USER_AUTHENTICATION_ERROR = 'user-authentication-error';

const gqlClient = new GraphQLClient(getApiUrl('graphql'), {
	credentials: 'include',
	mode: 'cors',
	errorPolicy: 'all',
	// NOTE: this request middleware should be handling the process of adding the
	// authorization header, but it's not working correctly. The client request
	// method is wrapped below in the "executeGQLRequest" function to ensure the
	// authorization header is added.
	/* requestMiddleware: (request) => {
		return {
			...request,
			headers: {
				...request.headers,
				authorization: `Bearer ${getAccessToken()}`
			}
		};
	}, */
	responseMiddleware: (response) => {
		if (response instanceof Error) {
			throw response;
		} else if (response.errors) {
			response.errors.forEach((error) => {
				const errCode = error?.extensions?.code ?? '';

				if (errCode === 'UNAUTHENTICATED') {
					window.dispatchEvent(new CustomEvent(EVENT_USER_AUTHENTICATION_ERROR));
				}
			});

			throw new Error(response.errors[0].message);
		} else {
			const accessToken = response.headers.get('x-access-token');

			if (accessToken) {
				setAccessToken(accessToken);
			}
		}
	}
});

export function executeGQLRequest<T>(document: RequestDocument, variables: object = {}) {
	return gqlClient.request<T>(document, variables, {
		authorization: `Bearer ${getAccessToken()}`
	});
}

export default gqlClient;
