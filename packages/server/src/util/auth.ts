import { Request, Response } from 'express';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';

/**
 * Set a refresh token that will be sent as a cookie on the provided Response object.
 * If the token value is empty, the existing "refresh" cookie will be cleared.
 *
 * @param response The Response object to attach or clear the cookie from
 * @param refreshToken The refresh token to be set
 */
export function setResponseRefreshTokenCookie(response: Response, refreshToken: string) {
	if (refreshToken.trim()) {
		response.cookie('refresh', refreshToken.trim(), {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 86400 * 30 * 1000
		});
	} else {
		response.clearCookie('refresh');
	}
}

/**
 * Set the "X-Access-Token" header value on the provided Response object with the
 * specified access token
 *
 * @param response The response object to set the "X-Access-Token" header value on
 * @param accessToken The access token value
 */
export function setResponseAccessTokenHeader(response: Response, accessToken: string) {
	response.setHeader('X-Access-Token', accessToken);
}

/**
 * Extract the access token value from the provided Request if the "authorization"
 * header is in the "Bearer <token>" format
 *
 * @param request The Request object
 * @returns The extracted access token value
 */
export function extractAccessTokenFromHeader(request: Request) {
	const [type, token] = request.headers.authorization?.split(' ') ?? [];

	return type === 'Bearer' ? token : '';
}

/**
 * Return the refresh token value as stored in the "refresh" cookie value of the
 * provided Request object
 *
 * @param request The request object
 * @returns The refresh token cookie that was sent from the client
 */
export function getCurrentRefreshToken(request: Request): string {
	return request.cookies['refresh'] ?? '';
}

/**
 * Constructs a cache key to be used with Redis for the provided reset ID value
 *
 * @param resetId The reset ID value
 * @returns Cache key that can be used with Redis
 */
export function getResetIdCacheKey(resetId: string) {
	return `password-reset-user-id:${resetId}`;
}

/**
 * Generates a reset ID value
 *
 * @returns A reset ID string
 */
export function generateResetId() {
	const customNanoId = customAlphabet(alphanumeric);

	return customNanoId();
}
