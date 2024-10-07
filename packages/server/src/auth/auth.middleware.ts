import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthTokensService } from 'src/auth-tokens/authTokens.service';
import { DbUserService } from 'src/services/db/dbUser.service';
import { extractAccessTokenFromHeader, getCurrentRefreshToken } from 'src/util/auth';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(
		private dbUserService: DbUserService,
		private authTokensService: AuthTokensService
	) {}

	async use(req: Request, res: Response, next: NextFunction) {
		if (req.user) {
			next();
			return;
		}

		const accessToken = extractAccessTokenFromHeader(req);
		const refreshToken = getCurrentRefreshToken(req);

		if (accessToken) {
			const userId = await this.authTokensService.getUserIdFromAccessToken(accessToken);

			if (userId) {
				const user = await this.dbUserService.getById(userId);

				// Check that the user is valid and that a valid refresh token
				// cookie has also been sent. If the refresh token doesn't exist
				// with the user record, we shouldn't allow the user to be authenticated
				// since they will be logged out after the current access token expires.
				// This is how the "logout all sessions" functionality works.
				if (user && refreshToken && user.refreshTokens.includes(refreshToken)) {
					req.user = user;
					next();
					return;
				}
			}
		}

		if (refreshToken) {
			const userByRefreshToken = await this.dbUserService.getByRefreshToken(refreshToken);

			if (!userByRefreshToken) {
				req.auth_clear_refresh_token_cookie = true;
				next();
				return;
			}

			const refreshTokenUserId =
				await this.authTokensService.getUserIdFromRefreshToken(refreshToken);

			if (!refreshTokenUserId) {
				req.auth_clear_refresh_token_cookie = true;
				next();
				return;
			}

			if (userByRefreshToken.id !== refreshTokenUserId) {
				await this.dbUserService.removeRefreshToken(userByRefreshToken.id, refreshToken);

				req.auth_clear_refresh_token_cookie = true;

				next();
				return;
			}

			// generate a new refresh token, replace the current one in the DB,
			// and set the new cookie
			const newRefreshToken = await this.authTokensService.generateRefreshTokenForUserID(
				userByRefreshToken.id
			);

			req.auth_replace_refresh_token_cookie = {
				userId: userByRefreshToken.id,
				oldRefresh: getCurrentRefreshToken(req),
				newRefresh: newRefreshToken
			};

			// generate a new access token and send it with the request as a
			// custom header
			const newAccessToken = await this.authTokensService.generateAccessTokenForUserID(
				userByRefreshToken.id
			);

			req.auth_set_access_token_header = newAccessToken;
			req.user = userByRefreshToken;
		}

		next();
	}
}
