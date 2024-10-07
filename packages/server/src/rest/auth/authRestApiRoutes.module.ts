import { Module } from '@nestjs/common';
// import { AuthTokensModule } from 'src/auth-tokens/authTokens.module';
// import { AuthTokensService } from 'src/auth-tokens/authTokens.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { AuthRestApiRoutesController } from './authRestApiRoutes.controller';

@Module({
	imports: [AuthModule],
	controllers: [AuthRestApiRoutesController],
	providers: [AuthGuard]
})
export class AuthRestApiRoutesModule {}
