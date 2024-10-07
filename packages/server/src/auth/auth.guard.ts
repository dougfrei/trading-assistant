import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import EUserRoleType from 'src/enums/EUserRoleType';
import { DbUserService } from 'src/services/db/dbUser.service';
import { setResponseAccessTokenHeader, setResponseRefreshTokenCookie } from 'src/util/auth';
import { Roles } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private dbUserService: DbUserService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// allow the route if the @SkipAuthCheck decorator was used
		const skipAuthCheck = this.reflector.getAllAndOverride<boolean>('skipAuthCheck', [
			context.getHandler(),
			context.getClass()
		]);

		if (skipAuthCheck) {
			return true;
		}

		// check if the @DisableRefreshTokenRegeneration decorator was used
		const disableRefreshTokenRegeneration = this.reflector.getAllAndOverride<boolean>(
			'disableRefreshTokenRegeneration',
			[context.getHandler(), context.getClass()]
		);

		// get the request and response objects from the correct context depending
		// on the type of request (REST or GraphQL)
		const req =
			context.getType<GqlContextType>() === 'graphql'
				? GqlExecutionContext.create(context).getContext().req
				: context.switchToHttp().getRequest();

		const res =
			context.getType<GqlContextType>() === 'graphql'
				? GqlExecutionContext.create(context).getContext().res
				: context.switchToHttp().getResponse();

		// clear the refresh token cookie that will be sent in the response if the
		// auth middleware has requested to do so
		if (req.auth_clear_refresh_token_cookie) {
			setResponseRefreshTokenCookie(res, '');
		}

		// set a refresh token cookie that will be sent in the response if the
		// auth middleware has requested to do so
		if (req.auth_replace_refresh_token_cookie) {
			// If the @DisableRefreshTokenRegeneration decorator has been used to
			// prevent refresh token regeneration (ex: REST /auth/logout), remove
			// the current refresh token from the DB and clear the cookie.
			// Otherwise, replace the refresh token in the DB and update the cookie.
			if (disableRefreshTokenRegeneration) {
				await this.dbUserService.removeRefreshToken(
					req.auth_replace_refresh_token_cookie.userId,
					req.auth_replace_refresh_token_cookie.oldRefresh
				);

				setResponseRefreshTokenCookie(res, '');
			} else {
				await this.dbUserService.replaceRefreshToken(
					req.auth_replace_refresh_token_cookie.userId,
					req.auth_replace_refresh_token_cookie.oldRefresh,
					req.auth_replace_refresh_token_cookie.newRefresh
				);

				setResponseRefreshTokenCookie(
					res,
					req.auth_replace_refresh_token_cookie.newRefresh
				);
			}
		}

		// set the access token header that will be sent in the response if the
		// auth middleware has requested to do so
		if (req.auth_set_access_token_header) {
			setResponseAccessTokenHeader(res, req.auth_set_access_token_header);
		}

		if (!('user' in req)) {
			throw new UnauthorizedException();
		}

		const roles = this.reflector.get(Roles, context.getHandler());

		if (Array.isArray(roles)) {
			const neededRoles = new Set(roles);
			const userRoles = new Set(req?.user?.roles ?? []);

			if (!userRoles.has(EUserRoleType.ADMIN) && !neededRoles.isSubsetOf(userRoles)) {
				return false;
			}
		}

		return true;
	}
}
