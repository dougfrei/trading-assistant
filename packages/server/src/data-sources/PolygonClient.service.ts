import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ECandlePeriodType, getYMDdateString } from '@trading-assistant/common';
import { URL } from 'node:url';
import {
	IPolygonGroupedDailyResponse,
	IPolygonMarketHolidaysItem,
	IPolygonNewsItem,
	IPolygonNewsResponse,
	IPolygonStockSplitsResponse,
	validPolygonNewsItem
} from 'src/data-sources/PolygonClient.interfaces';
import ICandleDTO, { validCandleDTO } from 'src/interfaces/ICandleDTO';
import IMarketHolidayDTO, { validMarketHolidayDTO } from 'src/interfaces/IMarketHolidayDTO';
import IStockSplitDTO, { validStockSplitDTO } from 'src/interfaces/IStockSplitDTO';
import { DEFAULT_MARKET_TICKER_SYMBOL, SECONDS_24H } from 'src/util/constants';
import { getNYMarketOpenDateObject } from 'src/util/date';
import simpleFetch from 'src/util/simple-fetch';
import SimpleFetchResponseError from 'src/util/simple-fetch/SimpleFetchResponseError';
import SimpleFetchValidationError from 'src/util/simple-fetch/SimpleFetchValidationError';
import * as v from 'valibot';

@Injectable()
class PolygonClientService {
	private readonly logger = new Logger(PolygonClientService.name);

	protected apiKey = '';
	protected apiUrlBase = 'https://api.polygon.io';

	constructor(
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		@Inject(ConfigService) private readonly configService: ConfigService
	) {
		const apiKey = this.configService.get('POLYGON_API_KEY');

		if (typeof apiKey !== 'string') {
			throw new Error('POLYGON_API_KEY environment variable not set');
		}

		if (!apiKey.trim()) {
			throw new Error('POLYGON_API_KEY environment variable is not a valid string');
		}

		this.apiKey = apiKey;
	}

	protected getRequestURL(endpoint: string, params: Record<string, string> = {}): string {
		const url = new URL(`${this.apiUrlBase}/${endpoint}`);

		url.searchParams.append('apiKey', this.apiKey);

		for (const paramKey in params) {
			url.searchParams.append(paramKey, params[paramKey]);
		}

		return url.toString();
	}

	protected async handleError(err: unknown, endpointURL: string) {
		if (err instanceof SimpleFetchResponseError) {
			const jsonContent = await err.response.json();

			this.logger.error(
				{
					endpointURL,
					httpStatus: err.response.status,
					statusText: err.response.statusText,
					bodyContent: jsonContent
				},
				err.message
			);

			throw new Error(err.message);
		} else if (err instanceof SimpleFetchValidationError) {
			this.logger.error(
				{
					endpointURL,
					errors: err.validationErrors
				},
				err.message
			);

			throw new Error(err.message);
		}

		throw err;
	}

	async getDailyCandles(dateObj: Date): Promise<ICandleDTO[]> {
		if (!this.apiKey) {
			throw new Error(
				'Cannot call method without setting POLYGON_API_KEY environment variable'
			);
		}

		const ymdDateStr = getYMDdateString(dateObj);

		const cacheKey = `polygon:daily-candles:${ymdDateStr}`;
		const cachedRecords = await this.cacheManager.get<ICandleDTO[]>(cacheKey);

		const validationResult = v.safeParse(v.array(validCandleDTO), cachedRecords);

		if (validationResult.success) {
			console.log(`using cached Polygon.io daily candles [${ymdDateStr}]`);

			return validationResult.output;
		}

		console.log(`getting new Polygon.io daily candles [${ymdDateStr}]`);

		const endpointURL = this.getRequestURL(
			`v2/aggs/grouped/locale/us/market/stocks/${ymdDateStr}`,
			{
				adjusted: 'true'
			}
		);
		let candleDTOobjects: ICandleDTO[] = [];

		try {
			const response = await simpleFetch<IPolygonGroupedDailyResponse>(endpointURL, {
				validateSchema: v.object({
					request_id: v.string(),
					status: v.string(),
					message: v.optional(v.string(), ''),
					adjusted: v.boolean(),
					queryCount: v.number(),
					resultsCount: v.number(),
					count: v.number(),
					results: v.array(
						v.object({
							T: v.string(),
							o: v.number(),
							h: v.number(),
							l: v.number(),
							c: v.number(),
							v: v.number(),
							t: v.number()
						})
					)
				}),
				responseErrorText:
					'An error occurred while requesting the grouped daily bars from Polygon',
				validationErrorText:
					'Polygon API grouped daily bars response failed schema validation'
			});

			candleDTOobjects = response.results.map((record) => ({
				tickerSymbol: record.T.toUpperCase().trim(),
				open: record.o,
				high: record.h,
				low: record.l,
				close: record.c,
				volume: record.v,
				// period: new Date(record.t),
				period: getNYMarketOpenDateObject(getYMDdateString(new Date(record.t))),
				periodType: ECandlePeriodType.D
			}));

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, candleDTOobjects, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return candleDTOobjects;
	}

	async getStockSplitsForDate(dateObj: Date): Promise<IStockSplitDTO[]> {
		if (!this.apiKey) {
			throw new Error(
				'Cannot call method without setting POLYGON_API_KEY environment variable'
			);
		}

		const ymdDateStr = getYMDdateString(dateObj);

		const cacheKey = `polygon:stock-splits:${ymdDateStr}`;
		const cachedRecords = await this.cacheManager.get<IStockSplitDTO[]>(cacheKey);

		const validationResult = v.safeParse(v.array(validStockSplitDTO), cachedRecords);

		if (validationResult.success) {
			console.log(`using cached Polygon.io stock split records [${ymdDateStr}]`);
			return validationResult.output;
		}

		console.log(`getting new Polygon.io stock split records [${ymdDateStr}]`);

		const endpointURL = this.getRequestURL('v3/reference/splits', {
			execution_date: ymdDateStr
		});
		let stockSplitDTOobjects: IStockSplitDTO[] = [];

		try {
			const response = await simpleFetch<IPolygonStockSplitsResponse>(endpointURL, {
				validateSchema: v.object({
					request_id: v.string(),
					status: v.string(),
					message: v.optional(v.string(), ''),
					next_url: v.optional(v.string(), ''),
					results: v.array(
						v.object({
							execution_date: v.string(),
							split_from: v.number(),
							split_to: v.number(),
							ticker: v.pipe(v.string(), v.trim(), v.toUpperCase(), v.minLength(1))
						})
					)
				}),
				responseErrorText:
					'An error occurred while requesting stock split data from Polygon',
				validationErrorText: 'Polygon API stock splits response failed schema validation'
			});

			stockSplitDTOobjects = response.results.map((record) => ({
				tickerSymbol: record.ticker,
				from: record.split_from,
				to: record.split_to,
				executionDate: getNYMarketOpenDateObject(record.execution_date)
			}));

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, stockSplitDTOobjects, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return stockSplitDTOobjects;
	}

	async getUpcomingMarketHolidays() {
		if (!this.apiKey) {
			throw new Error(
				'Cannot call method without setting POLYGON_API_KEY environment variable'
			);
		}

		const cacheKey = 'polygon:upcoming-market-holidays';
		const cachedRecords = await this.cacheManager.get<IMarketHolidayDTO[]>(cacheKey);

		const validationResult = v.safeParse(v.array(validMarketHolidayDTO), cachedRecords);

		if (validationResult.success) {
			console.log('using cached Polygon.io market holiday records');
			return validationResult.output;
		}

		console.log('getting new Polygon.io market holiday records');

		const endpointURL = this.getRequestURL('v1/marketstatus/upcoming');
		let marketHolidayDTOobjects: IMarketHolidayDTO[] = [];

		try {
			const response = await simpleFetch<IPolygonMarketHolidaysItem[]>(endpointURL, {
				validateSchema: v.array(
					v.object({
						date: v.string(),
						exchange: v.string(),
						name: v.string(),
						status: v.string(),
						open: v.optional(v.string(), ''),
						close: v.optional(v.string(), '')
					})
				),
				responseErrorText:
					'An error occurred while requesting market holiday data from Polygon',
				validationErrorText: 'Polygon API market holidays response failed schema validation'
			});

			marketHolidayDTOobjects = response.reduce<IMarketHolidayDTO[]>((acum, record) => {
				if (record.exchange.toUpperCase() !== 'NYSE') {
					return acum;
				}

				acum.push({
					dateYMD: record.date,
					isEarlyClose: record.status === 'early-close'
				});

				return acum;
			}, []);

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, marketHolidayDTOobjects, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return marketHolidayDTOobjects;
	}

	async getTickerSymbolNews(
		tickerSymbol = DEFAULT_MARKET_TICKER_SYMBOL
	): Promise<IPolygonNewsItem[]> {
		if (!this.apiKey) {
			throw new Error(
				'Cannot call method without setting POLYGON_API_KEY environment variable'
			);
		}

		const cacheKey = `polygon:news:${tickerSymbol}`;
		const cachedRecords = await this.cacheManager.get<IMarketHolidayDTO[]>(cacheKey);

		const validationResult = v.safeParse(v.array(validPolygonNewsItem), cachedRecords);

		if (validationResult.success) {
			console.log('using cached Polygon.io ticker symbol news records');
			return validationResult.output;
		}

		console.log('getting new Polygon.io ticker symbol news records');

		const endpointURL = this.getRequestURL('v2/reference/news', {
			ticker: tickerSymbol
		});

		try {
			const response = await simpleFetch<IPolygonNewsResponse>(endpointURL, {
				validateSchema: v.object({
					request_id: v.string(),
					status: v.string(),
					next_url: v.string(),
					count: v.number(),
					results: v.array(validPolygonNewsItem)
				}),
				responseErrorText:
					'An error occurred while requesting ticker symbol news data from Polygon',
				validationErrorText:
					'Polygon API ticker symbol news response failed schema validation'
			});

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, response.results, { ttl: 1800 });

			return response.results;
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return [];
	}
}

export default PolygonClientService;
