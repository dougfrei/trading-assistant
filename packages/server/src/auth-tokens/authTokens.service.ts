import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_TOKENS_OPTIONS } from './authTokens.module-definition';
import { IAuthTokensModuleOptions } from './interfaces/IAuthTokensModuleOptions';

@Injectable()
export class AuthTokensService {
	constructor(
		@Inject(AUTH_TOKENS_OPTIONS) private options: IAuthTokensModuleOptions,
		private jwtService: JwtService
	) {}

	async generateAccessTokenForUserID(userId: number): Promise<string> {
		return await this.jwtService.signAsync(
			{
				userId
			},
			{
				secret: this.options.accessTokenSecret,
				expiresIn: this.options.accessTokenExpireMinutes * 60
			}
		);
	}

	async generateRefreshTokenForUserID(userId: number): Promise<string> {
		return await this.jwtService.signAsync(
			{
				userId
			},
			{
				secret: this.options.refreshTokenSecret,
				expiresIn: this.options.refreshTokenExpireMinutes * 60
			}
		);
	}

	protected async getUserIdFromToken(token: string, secret: string) {
		let userId = 0;

		try {
			const payload = await this.jwtService.verifyAsync<{
				userId: number;
			}>(token, {
				secret
			});

			userId = payload?.userId ?? 0;
		} catch {
			// console.error('error verifying JWT', token);
		}

		return userId;
	}

	async getUserIdFromAccessToken(token: string) {
		return await this.getUserIdFromToken(token, this.options.accessTokenSecret);
	}

	async getUserIdFromRefreshToken(token: string) {
		return await this.getUserIdFromToken(token, this.options.refreshTokenSecret);
	}
}
