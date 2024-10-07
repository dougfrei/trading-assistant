export interface IAuthTokensModuleOptions {
	accessTokenSecret: string;
	refreshTokenSecret: string;
	accessTokenExpireMinutes: number;
	refreshTokenExpireMinutes: number;
}
