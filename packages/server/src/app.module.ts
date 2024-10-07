import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import authModules from 'src/app-module-import-groups/auth';
import coreModules from 'src/app-module-import-groups/core';
import globalModules from 'src/app-module-import-groups/globals';
import graphQLModules from 'src/app-module-import-groups/graphql';
import redisModules from 'src/app-module-import-groups/redis';
import restApiModules from 'src/app-module-import-groups/rest-api';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { AppConfigModule } from './app-config/appConfig.module';
import { AppGlobalsModule } from './app-globals/appGlobals.module';
import { CandleUtilitiesModule } from './services/candle-utilities/candleUtilities.module';
import { GeneralUtilitiesModule } from './services/general-utilities/generalUtilities.module';
import { TickerSymbolUtilitiesModule } from './services/ticker-symbol-utilities/tickerSymbolUtilities.module';

@Module({
	imports: [
		AppGlobalsModule,
		...coreModules,
		...redisModules,
		...globalModules,
		...authModules,
		...restApiModules,
		...graphQLModules,
		CandleUtilitiesModule,
		TickerSymbolUtilitiesModule,
		GeneralUtilitiesModule,
		AppConfigModule
	],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AuthGuard
		}
	]
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('*');
	}
}
