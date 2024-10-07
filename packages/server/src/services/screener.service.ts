import { Injectable, Logger } from '@nestjs/common';
import {
	ECandlePeriodType,
	ETickerSymbolType,
	IScreenerQueryLogicRoot,
	getYMDdateString
} from '@trading-assistant/common';
import { GraphQLError } from 'graphql';
import { sql } from 'kysely';
import { Database } from 'src/db/db.module';
import { Candle } from 'src/entities/Candle.model';
import { TickerSymbol } from 'src/entities/TickerSymbol.model';
import EScreenerSortMethod from 'src/enums/EScreenerSortMethod';
import IScreenerResults from 'src/interfaces/IScreenerResults';
import IScreenerResultsParams from 'src/interfaces/IScreenerResultsParams';
import { isScreenerQueryLogicRoot, isScreenerQueryValueComparison } from 'src/util/screenerQuery';
import { CandlesService } from './candle-utilities/candles.service';
import { DbScreenerQueryService } from './db/dbScreenerQuery.service';

interface IGetRawQueryCandlesParams {
	period?: Date | null;
	periodType?: ECandlePeriodType;
	page?: number;
	perPage?: number;
	sort?: EScreenerSortMethod;
	sectorGCIS?: string;
	queryId?: number;
}

interface IGetRawQueryCandlesReturn {
	totalCount: number;
	records: { candle: Candle; tickerSymbol: TickerSymbol }[];
}

interface IGetRawQueryResultRow {
	c_id: number;
	c_ticker_symbol_id: number;
	c_open: number;
	c_high: number;
	c_low: number;
	c_close: number;
	c_volume: number;
	c_period: Date;
	c_period_type: ECandlePeriodType;
	c_indicators: Record<string, number>;
	c_alerts: string[];
	c_truncated_values: Record<string, number>;
	t_id: number;
	t_name: string;
	t_label: string;
	t_avg_daily_vol: number;
	t_last_price: number;
	t_market_cap: string;
	t_all_time_high: number;
	t_all_time_low: number;
	t_ttm_high: number;
	t_ttm_low: number;
	t_active: boolean;
	t_type: ETickerSymbolType;
	t_gcis: string;
	t_truncated_values: Record<string, number>;
}

@Injectable()
export class ScreenerService {
	private readonly logger = new Logger(ScreenerService.name);

	constructor(
		private readonly dbScreenerQueryService: DbScreenerQueryService,
		private readonly candlesService: CandlesService,
		private readonly db: Database
	) {}

	/**
	 * Rudimentary string sanitizer since this class makes use of raw DB queries.
	 * All non-alphanumeric characters (with the exception of underscores) will
	 * be removed from the input value.
	 *
	 * @param value The string value to sanitize
	 * @returns A string with non-alphanumeric characters removed
	 */
	protected sanitizeQueryVar(value: string) {
		return value.replace(/\W+/g, '');
	}

	protected async getRawQueryCandles({
		period = null,
		periodType = ECandlePeriodType.D,
		page = 1,
		perPage = 25,
		sort = EScreenerSortMethod.TICKER,
		sectorGCIS = '',
		queryId = 0
	}: IGetRawQueryCandlesParams): Promise<IGetRawQueryCandlesReturn> {
		/**
		 * Get default period (latest candle) if needed
		 */
		if (!period) {
			try {
				const latestMarketCandle = await this.candlesService.getMostRecentMarketCandle(
					ECandlePeriodType.D
				);

				period = latestMarketCandle.period;
			} catch (err: unknown) {
				throw new GraphQLError(
					err instanceof Error
						? err.message
						: 'An error occurred while loading the latest market reference candle'
				);
			}
		}

		/**
		 * WHERE clauses
		 */
		const whereClauses: string[] = [`candles.period_type = '${periodType}'::t_period_type`];

		switch (periodType) {
			case ECandlePeriodType.D: {
				const periodDateObj = new Date(period);

				whereClauses.push(
					`candles.period >= '${getYMDdateString(periodDateObj)} 00:00:00'`
				);
				whereClauses.push(
					`candles.period <= '${getYMDdateString(periodDateObj)} 23:59:59'`
				);

				break;
			}

			default:
				break;
		}

		if (sectorGCIS) {
			whereClauses.push(`ticker_symbols.gcis LIKE '${this.sanitizeQueryVar(sectorGCIS)}%'`);
		}

		if (queryId) {
			const screenerQuery = await this.dbScreenerQueryService.getById(queryId);

			if (!screenerQuery) {
				return {
					totalCount: 0,
					records: []
				};
			}

			if (screenerQuery && isScreenerQueryLogicRoot(screenerQuery.query)) {
				whereClauses.push(this.processQueryRootRaw(screenerQuery.query, false));
			}
		}

		/**
		 * ORDER BY clause
		 */
		let orderKey = 'ticker_symbols.name';
		let orderDir: 'ASC' | 'DESC' = 'ASC';

		switch (sort) {
			case EScreenerSortMethod.AVG_DAILY_VOL_ASC:
				orderKey = 'ticker_symbols.avg_daily_vol';
				orderDir = 'ASC';
				break;

			case EScreenerSortMethod.AVG_DAILY_VOL_DESC:
				orderKey = 'ticker_symbols.avg_daily_vol';
				orderDir = 'DESC';
				break;

			case EScreenerSortMethod.TICKER:
			default:
				break;
		}

		/**
		 * SQL queries
		 */
		const countQuery = `
			SELECT COUNT(*) AS total_count
			FROM candles
			JOIN ticker_symbols ON ticker_symbols.id = candles.ticker_symbol_id
			WHERE ${whereClauses.join(' AND ')}
		`;

		const resultsQuery = `
			SELECT
				candles.id AS c_id,
				candles.ticker_symbol_id AS c_ticker_symbol_id,
				candles.open AS c_open,
				candles.high AS c_high,
				candles.low AS c_low,
				candles.close AS c_close,
				candles.volume AS c_volume,
				candles.period AS c_period,
				candles.period_type AS c_period_type,
				candles.indicators AS c_indicators,
				candles.alerts AS c_alerts,
				candles.truncated_values AS c_truncated_values,
				ticker_symbols.id AS t_id,
				ticker_symbols.name AS t_name,
				ticker_symbols.label AS t_label,
				ticker_symbols.avg_daily_vol AS t_avg_daily_vol,
				ticker_symbols.last_price AS t_last_price,
				ticker_symbols.market_cap AS t_market_cap,
				ticker_symbols.all_time_high AS t_all_time_high,
				ticker_symbols.all_time_low AS t_all_time_low,
				ticker_symbols.ttm_high AS t_ttm_high,
				ticker_symbols.ttm_low AS t_ttm_low,
				ticker_symbols.active AS t_active,
				ticker_symbols.type AS t_type,
				ticker_symbols.gcis AS t_gcis,
				ticker_symbols.truncated_values AS t_truncated_values
			FROM candles
			JOIN ticker_symbols ON ticker_symbols.id = candles.ticker_symbol_id
			WHERE ${whereClauses.join(' AND ')}
			ORDER BY ${orderKey} ${orderDir}
			LIMIT ${perPage}
			OFFSET ${(page - 1) * perPage}
		`;

		/**
		 * Execute queries and map results
		 */
		try {
			const countRes = await sql.raw<{ total_count: number }>(countQuery).execute(this.db);
			const resultsRes = await sql.raw<IGetRawQueryResultRow>(resultsQuery).execute(this.db);

			const records = resultsRes.rows.map((record) => ({
				candle: Candle.fromDbRecord({
					id: record.c_id,
					ticker_symbol_id: record.c_ticker_symbol_id,
					open: record.c_open,
					high: record.c_high,
					low: record.c_low,
					close: record.c_close,
					volume: record.c_volume,
					period: record.c_period,
					period_type: record.c_period_type,
					indicators: record.c_indicators,
					alerts: record.c_alerts,
					truncated_values: record.c_truncated_values
				}),
				tickerSymbol: TickerSymbol.fromDbRecord({
					id: record.t_id,
					name: record.t_name,
					label: record.t_label,
					avg_daily_vol: record.t_avg_daily_vol,
					market_cap: BigInt(record.t_market_cap),
					last_price: record.t_last_price,
					all_time_high: record.t_all_time_high,
					all_time_low: record.t_all_time_low,
					ttm_high: record.t_ttm_high,
					ttm_low: record.t_ttm_low,
					active: record.t_active,
					type: record.t_type,
					gcis: record.t_gcis,
					truncated_values: record.t_truncated_values
				})
			}));

			return {
				totalCount: countRes.rows[0]?.total_count ?? 0,
				records
			};
		} catch (err: unknown) {
			this.logger.error(err);
		}

		return {
			totalCount: 0,
			records: []
		};
	}

	protected getComparisionValueSQL(value: string): string {
		let compareValue = '';

		if (value.at(0) === '#') {
			// referencing a candle/ticker record column
			switch (value) {
				case '#open':
				case '#high':
				case '#low':
				case '#close':
				case '#volume':
					compareValue = `candles.${value.slice(1)}`;
					break;

				case '#avg_daily_vol':
					compareValue = 'ticker_symbols.avg_daily_vol';
					break;

				case '#at_h':
					compareValue = 'ticker_symbols.all_time_high';
					break;

				case '#at_l':
					compareValue = 'ticker_symbols.all_time_low';
					break;

				case '#ttm_h':
					compareValue = 'ticker_symbols.ttm_high';
					break;

				case '#ttm_l':
					compareValue = 'ticker_symbols.ttm_low';
					break;

				default:
					break;
			}
		} else {
			// referencing an indicator value
			compareValue = `(candles.indicators->'${this.sanitizeQueryVar(value)}')::float`;
		}

		return compareValue;
	}

	protected processQueryRootRaw(
		rootLogic: IScreenerQueryLogicRoot,
		wrapWithParens = true
	): string {
		const { logic = '', conditions = [] } = rootLogic;

		if (!logic || !conditions.length) {
			return '';
		}

		const parts: string[] = [];

		for (const condition of conditions) {
			if (typeof condition === 'string') {
				// check if alert is set
				parts.push(`candles.alerts ? '${this.sanitizeQueryVar(condition)}'`);
			} else if (isScreenerQueryLogicRoot(condition)) {
				// check if this is a nested query logic root
				parts.push(this.processQueryRootRaw(condition, true));
			} else if (isScreenerQueryValueComparison(condition)) {
				const compareParts: string[] = [];

				if (typeof condition.leftValue === 'string') {
					compareParts.push(this.getComparisionValueSQL(condition.leftValue));
				} else if (typeof condition.leftValue === 'number') {
					compareParts.push(condition.leftValue.toString());
				}

				if (typeof condition.rightValue === 'string') {
					compareParts.push(this.getComparisionValueSQL(condition.rightValue));
				} else if (typeof condition.rightValue === 'number') {
					compareParts.push(condition.rightValue.toString());
				}

				if (compareParts.length === 2 && compareParts[0].trim() && compareParts[1].trim()) {
					parts.push(
						`${compareParts[0].trim()} ${condition.operator} ${compareParts[1].trim()}`
					);
				}
			}
		}

		const joinedParts = parts.join(logic.toUpperCase() === 'OR' ? ' OR ' : ' AND ');

		return wrapWithParens ? `(${joinedParts})` : joinedParts;
	}

	async getScreenerResults({
		periodType = ECandlePeriodType.D,
		page = 1,
		perPage = 25,
		sort = EScreenerSortMethod.TICKER,
		sectorGCIS = '',
		queryId = 0
	}: IScreenerResultsParams = {}): Promise<IScreenerResults> {
		const rawQueryRes = await this.getRawQueryCandles({
			periodType: periodType,
			page: page,
			perPage: perPage,
			sort: sort,
			sectorGCIS: sectorGCIS,
			queryId: queryId
		});

		const totalPages = Math.ceil(rawQueryRes.totalCount / perPage);

		if (page > totalPages) {
			page = totalPages > 0 ? totalPages : 1;
		}

		return {
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(rawQueryRes.totalCount / perPage),
				perPage: perPage,
				totalRecords: rawQueryRes.totalCount
			},
			results: rawQueryRes.records.map((record) => ({
				tickerSymbol: record.tickerSymbol,
				lastCandle: record.candle,
				meta: {
					change: 0
				}
			}))
		};
	}
}
