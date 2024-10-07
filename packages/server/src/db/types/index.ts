import { ColumnType } from 'kysely';
import { CandleTable } from './tables/candles';
import { NYSEMarketHolidaysTable } from './tables/nyseMarketHolidays';
import { RelationTradesToTradeTagsTable } from './tables/relationTradesToTradeTags';
import { ScreenerQueryTable } from './tables/screenerQueries';
import { TickerSymbolAVWAPTable } from './tables/tickerSymbolAVWAP';
import { TickerSymbolEarningsTable } from './tables/tickerSymbolEarnings';
import { TickerSymbolSplitsTable } from './tables/tickerSymbolSplits';
import { TickerSymbolTable } from './tables/tickerSymbols';
import { TradeAccountTable } from './tables/tradeAccounts';
import { TradeTagTable } from './tables/tradeTags';
import { TradeTable } from './tables/trades';
import { UsersTable } from './tables/users';

export interface IDatabaseOptions {
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
}

export type OptionalInsertUpdateColumnType<Select, InsertUpdate = Select> = ColumnType<
	Select,
	InsertUpdate | undefined,
	InsertUpdate | undefined
>;

export type OptionalInsertUpdateJSONColumnType<Select> = OptionalInsertUpdateColumnType<
	Select,
	string
>;

export interface ITables {
	ticker_symbols: TickerSymbolTable;
	ticker_symbol_earnings: TickerSymbolEarningsTable;
	ticker_symbol_splits: TickerSymbolSplitsTable;
	ticker_symbol_avwap: TickerSymbolAVWAPTable;
	candles: CandleTable;
	screener_queries: ScreenerQueryTable;
	trades: TradeTable;
	trade_accounts: TradeAccountTable;
	trade_tags: TradeTagTable;
	nyse_market_holidays: NYSEMarketHolidaysTable;
	users: UsersTable;
	_relation_trades_to_trade_tags: RelationTradesToTradeTagsTable;
}
