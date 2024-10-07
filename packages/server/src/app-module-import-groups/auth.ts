import { ConfigModule, ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import { AuthTokensModule } from 'src/auth-tokens/authTokens.module';
import { AuthModule } from 'src/auth/auth.module';

export default [
	AuthTokensModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (configService: ConfigService) => ({
			accessTokenSecret: configService.get('AUTH_ACCESS_TOKEN_SECRET') ?? nanoid(),
			refreshTokenSecret: configService.get('AUTH_REFRESH_TOKEN_SECRET') ?? nanoid(),
			accessTokenExpireMinutes: configService.get('AUTH_ACCESS_TOKEN_EXPIRE_MINUTES') ?? 5,
			refreshTokenExpireMinutes:
				configService.get('AUTH_REFRESH_TOKEN_EXPIRE_MINUTES') ?? 10080
		})
	}),
	AuthModule
];
