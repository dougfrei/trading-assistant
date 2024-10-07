export const ACCESS_TOKEN_KEY = 'accessToken';

/**
 * Retrieve the current access token value from local storage
 *
 * @returns The current access token value from local storage or an empty string if it has not been set
 */
export function getAccessToken() {
	return localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
}

/**
 * Set the current access token value in local storage
 *
 * @param value The access token value to set
 */
export function setAccessToken(value: string) {
	localStorage.setItem(ACCESS_TOKEN_KEY, value);
}

/**
 * Remove the current access token value from local storage
 */
export function removeAccessToken() {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
}
