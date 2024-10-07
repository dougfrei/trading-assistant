import { Global, Module } from '@nestjs/common';
import { DbCandleService } from 'src/services/db/dbCandle.service';
import { DbScreenerQueryService } from 'src/services/db/dbScreenerQuery.service';
import { DbTickerSymbolService } from 'src/services/db/dbTickerSymbol.service';
import { DbTickerSymbolEarningsService } from 'src/services/db/dbTickerSymbolEarnings.service';
import { DbTickerSymbolSplitsService } from 'src/services/db/dbTickerSymbolSplits.service';
import { DbTradeService } from 'src/services/db/dbTrade.service';
import { DbTradeAccountService } from 'src/services/db/dbTradeAccount.service';
import { DbTradeTagService } from 'src/services/db/dbTradeTag.service';
import { DbUserService } from 'src/services/db/dbUser.service';
import { DbNYSEMarketHolidaysService } from './dbNYSEMarketHolidays';

@Global()
@Module({
	providers: [
		DbCandleService,
		DbNYSEMarketHolidaysService,
		DbScreenerQueryService,
		DbTickerSymbolService,
		DbTickerSymbolEarningsService,
		DbTickerSymbolSplitsService,
		DbTradeService,
		DbTradeAccountService,
		DbTradeTagService,
		DbUserService
	],
	exports: [
		DbCandleService,
		DbNYSEMarketHolidaysService,
		DbScreenerQueryService,
		DbTickerSymbolService,
		DbTickerSymbolEarningsService,
		DbTickerSymbolSplitsService,
		DbTradeService,
		DbTradeAccountService,
		DbTradeTagService,
		DbUserService
	]
})
export class DbModule {}
