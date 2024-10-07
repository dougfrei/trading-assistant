import { Module } from '@nestjs/common';
import coreModules from 'src/app-module-import-groups/core';
import globalModules from 'src/app-module-import-groups/globals';
import redisModules from 'src/app-module-import-groups/redis';
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
		CandleUtilitiesModule,
		TickerSymbolUtilitiesModule,
		GeneralUtilitiesModule,
		AppConfigModule
	],
	providers: []
})
export class CLIAppModule {}
