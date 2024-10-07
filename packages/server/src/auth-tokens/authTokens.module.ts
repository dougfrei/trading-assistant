import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigurableAuthTokensModule } from './authTokens.module-definition';
import { AuthTokensService } from './authTokens.service';

@Global()
@Module({
	imports: [
		JwtModule.register({
			global: true
		})
	],
	providers: [AuthTokensService],
	exports: [AuthTokensService]
})
export class AuthTokensModule extends ConfigurableAuthTokensModule {}
