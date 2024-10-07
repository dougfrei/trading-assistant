import { DEFAULT_LOGIN_ERROR_MESSAGE, DEFAULT_LOGOUT_ERROR_MESSAGE } from '@src/constants';
import { IGqlUser } from '@src/interfaces/IGqlResponses';
import { getApiUrl } from '@src/util';
import * as v from 'valibot';
import { getAccessToken, removeAccessToken, setAccessToken } from './accessToken';

const restApiUserSchema = v.object({
	username: v.string(),
	displayName: v.string(),
	isAdmin: v.optional(v.boolean(), false)
});

export type TRestApiUser = v.InferOutput<typeof restApiUserSchema>;

/**
 * Send a GET request to the 'auth/user' endpoint which will return the current user
 * record if the stored access token is valid
 *
 * @param param Optional request parameters
 * @returns IRestUserApi object representing the current user or null if the stored access token is invalid
 */
export async function getCurrentUser({
	abortSignal
}: { abortSignal?: AbortSignal } = {}): Promise<TRestApiUser | null> {
	try {
		const accessToken = getAccessToken();
		const headers = new Headers();

		if (accessToken) {
			headers.set('Authorization', `Bearer ${accessToken}`);
		}

		const response = await fetch(getApiUrl('auth/user'), {
			method: 'GET',
			credentials: 'include',
			headers,
			signal: abortSignal ?? null
		});

		if (!response.ok) {
			return null;
		}

		const newAccessToken = response.headers.get('x-access-token');

		if (newAccessToken) {
			setAccessToken(newAccessToken);
		}

		const responseJson = await response.json();

		const validatedResponse = v.safeParse(restApiUserSchema, responseJson);

		return validatedResponse.success ? validatedResponse.output : null;
	} catch {
		return null;
	}
}

/**
 * Send a POST request to the 'auth/login' endpoint to login a user
 *
 * @param username Username value
 * @param password Password value
 * @param param Optional request parameters
 * @returns IRestUserApi object representing the user or null if an error occurred while logging in
 */
export async function loginUser(
	username: string,
	password: string,
	{ abortSignal }: { abortSignal?: AbortSignal } = {}
): Promise<TRestApiUser | null> {
	const response = await fetch(getApiUrl('auth/login'), {
		method: 'POST',
		credentials: 'include',
		body: new URLSearchParams({
			username,
			password
		}),
		signal: abortSignal ?? null
	});

	const responseJson = await response.json();

	if (!response.ok) {
		throw new Error(responseJson?.message ?? DEFAULT_LOGIN_ERROR_MESSAGE);
	}

	const newAccessToken = response.headers.get('X-Access-Token');

	if (newAccessToken) {
		setAccessToken(newAccessToken);
	}

	const validatedResponse = v.safeParse(restApiUserSchema, responseJson);

	return validatedResponse.success ? validatedResponse.output : null;
}

/**
 * Send a POST request to 'auth/logout' to logout the current user
 */
export async function logoutUser() {
	const response = await fetch(getApiUrl('auth/logout'), {
		method: 'POST',
		credentials: 'include'
	});

	const responseJson = await response.json();

	if (!response.ok) {
		throw new Error(responseJson?.message ?? DEFAULT_LOGOUT_ERROR_MESSAGE);
	}

	removeAccessToken();
}

/**
 * Send a POST request to 'auth/generate-reset-password-id' to generate a password
 * reset ID for the specified account
 *
 * @param username The username of the account that will have a password reset ID generated
 * @param param Optional request parameters
 * @returns Object with result status
 */
export async function generatePasswordResetId(
	username: string,
	{ abortSignal }: { abortSignal?: AbortSignal } = {}
) {
	const response = await fetch(getApiUrl('auth/generate-reset-password-id'), {
		method: 'POST',
		body: new URLSearchParams({
			username
		}),
		signal: abortSignal ?? null
	});

	const responseJson = await response.json();

	if (!response.ok) {
		throw new Error(
			responseJson?.message ??
				'An error occurred while resetting your password. Please try again.'
		);
	}

	const validatedResponse = v.safeParse(
		v.object({
			success: v.optional(v.boolean(), false),
			message: v.optional(v.string(), '')
		}),
		responseJson
	);

	if (!validatedResponse.success) {
		throw new Error('An error occurred while validating the server response data');
	}

	return validatedResponse.output;
}

/**
 * Send a POST request to 'auth/validate-reset-password-id' that will check if
 * the provided reset ID is valid
 *
 * @param resetId The password reset ID value
 * @param param Optional request parameters
 * @returns Object with result status
 */
export async function validatePasswordResetId(
	resetId: string,
	{ abortSignal }: { abortSignal?: AbortSignal } = {}
) {
	const response = await fetch(getApiUrl('auth/validate-reset-password-id'), {
		method: 'POST',
		body: new URLSearchParams({
			reset_id: resetId
		}),
		signal: abortSignal ?? null
	});

	const responseJson = await response.json();

	if (!response.ok) {
		throw new Error(
			responseJson?.message ??
				'An error occurred while validating the password reset link. It may be invalid or expired.'
		);
	}

	const validatedResponse = v.safeParse(
		v.object({
			success: v.optional(v.boolean(), false),
			message: v.optional(v.string(), '')
		}),
		responseJson
	);

	if (!validatedResponse.success) {
		throw new Error('An error occurred while validating the server response data');
	}

	return validatedResponse.output;
}

/**
 * Send a POST request to 'auth/reset-password' and reset the password for the
 * account associated with the specified reset ID
 *
 * @param resetId The reset ID value
 * @param newPassword The new password value
 * @param param Optional request parameters
 * @returns Object with result status
 */
export async function resetPassword(
	resetId: string,
	newPassword: string,
	{ abortSignal }: { abortSignal?: AbortSignal } = {}
) {
	const response = await fetch(getApiUrl('auth/reset-password'), {
		method: 'POST',
		body: new URLSearchParams({
			reset_id: resetId,
			new_password: newPassword
		}),
		signal: abortSignal ?? null
	});

	const responseJson = await response.json();

	if (!response.ok) {
		throw new Error(
			responseJson?.message ??
				'An error occurred while resetting your password. Please try again.'
		);
	}

	const validatedResponse = v.safeParse(
		v.object({
			success: v.optional(v.boolean(), false)
		}),
		responseJson
	);

	if (!validatedResponse.success) {
		throw new Error('An error occurred while validating the server response data');
	}

	return validatedResponse.output;
}

/**
 * Send a POST request to 'auth/validate-activate-id' that will check if the
 * provided account activate ID value is valid
 *
 * @param activateId The account activate ID value
 * @param param Optional request parameters
 * @returns Object with result status
 */
export async function validateAccountActivateId(
	activateId: string,
	{ abortSignal }: { abortSignal?: AbortSignal } = {}
) {
	const response = await fetch(getApiUrl('auth/validate-activate-id'), {
		method: 'POST',
		body: new URLSearchParams({
			activate_id: activateId
		}),
		signal: abortSignal ?? null
	});

	const responseJson = await response.json();

	if (!response.ok) {
		throw new Error(
			responseJson?.message ??
				'An error occurred while validating the account activation link.'
		);
	}

	const validatedResponse = v.safeParse(
		v.object({
			success: v.optional(v.boolean(), false),
			user: restApiUserSchema
		}),
		responseJson
	);

	if (!validatedResponse.success) {
		throw new Error('An error occurred while validating the server response data');
	}

	return validatedResponse.output;
}

/**
 * Send a POST request to 'auth/activate-account' and activate the account for
 * the associated account activate ID value and set a new password
 *
 * @param activateId The account activate ID value
 * @param password The new account password
 * @param param Optional request parameters
 * @returns Object with result status
 */
export async function activateAccount(
	activateId: string,
	password: string,
	{ abortSignal }: { abortSignal?: AbortSignal } = {}
) {
	const response = await fetch(getApiUrl('auth/activate-account'), {
		method: 'POST',
		body: new URLSearchParams({
			activate_id: activateId,
			password
		}),
		signal: abortSignal ?? null
	});

	const responseJson = await response.json();

	if (!response.ok) {
		throw new Error(
			responseJson?.message ??
				'An error occurred while activating your account. Please try again.'
		);
	}

	const validatedResponse = v.safeParse(
		v.object({
			success: v.optional(v.boolean(), false),
			user: restApiUserSchema
		}),
		responseJson
	);

	if (!validatedResponse.success) {
		throw new Error('An error occurred while validating the server response data');
	}

	return validatedResponse.output;
}

/**
 * Check if a user has been assigned the specified role. This check will always
 * return true if a user has the 'admin' role even if the tested role value hasn't
 * been explicitly assigned.
 *
 * @param user The user object
 * @param role The role value to check
 * @returns Boolean value indicating the the user has the requested role
 */
export function userHasRole(user: IGqlUser, role: string) {
	return user.roles.includes('admin') || user.roles.includes(role);
}
