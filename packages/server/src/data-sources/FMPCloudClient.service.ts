import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	ECandlePeriodType,
	getYMDdateString,
	isValidYMDdateString
} from '@trading-assistant/common';
import { URL } from 'node:url';
import {
	IFMPCloudEODRecord,
	IFMPCloudEconomicCalendarItem,
	IFMPCloudHistoricalDataResponse,
	IFMPCloudStockScreenerItem,
	IFMPCloudStockSplitCalendarItem,
	IFMPCloudTradableSymbol
} from 'src/data-sources/FMPCloudClient.interfaces';
import ICandleDTO, { validCandleDTO } from 'src/interfaces/ICandleDTO';
import IStockSplitDTO, { validStockSplitDTO } from 'src/interfaces/IStockSplitDTO';
import { SECONDS_24H } from 'src/util/constants';
import { generateMD5 } from 'src/util/crypto';
import { getNYMarketOpenDateObject } from 'src/util/date';
import { getFMPErrorMessage } from 'src/util/fmp/fmp-util';
import {
	fmpCloudEconomicCalendarItemValidator,
	fmpCloudStockScreenerItemValidator,
	fmpCloudTradableSymbolItemValidator
} from 'src/util/fmp/fmp-validators';
import simpleFetch from 'src/util/simple-fetch';
import SimpleFetchResponseError from 'src/util/simple-fetch/SimpleFetchResponseError';
import SimpleFetchValidationError from 'src/util/simple-fetch/SimpleFetchValidationError';
import * as v from 'valibot';

interface TGetStockScreenerResultsParams {
	isEtf?: boolean;
	isActivelyTrading?: boolean;
	limit?: number;
	exchange?: string;
}

@Injectable()
class FMPCloudClientService {
	private readonly logger = new Logger(FMPCloudClientService.name);

	protected apiKey = '';
	protected readonly apiUrlBase = 'https://fmpcloud.io/api';

	constructor(
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		@Inject(ConfigService) private readonly configService: ConfigService
	) {
		const apiKey = this.configService.get('FMP_CLOUD_API_KEY');

		if (typeof apiKey !== 'string') {
			throw new Error('FMP_CLOUD_API_KEY environment variable not set');
		}

		if (!apiKey.trim()) {
			throw new Error('FMP_CLOUD_API_KEY environment variable is not a valid string');
		}

		this.apiKey = apiKey;
	}

	protected getRequestUrl(endpoint: string, params: Record<string, unknown> = {}): string {
		const url = new URL(`${this.apiUrlBase}/${endpoint}`);

		url.searchParams.append('apikey', this.apiKey);

		for (const paramKey in params) {
			url.searchParams.append(paramKey, String(params[paramKey]));
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

			throw new Error(getFMPErrorMessage(jsonContent, err.message));
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

	// NOTE: endpoint no longer available on free plan
	async getDailyCandles(date: Date): Promise<ICandleDTO[]> {
		if (!this.apiKey) {
			throw new Error(
				'Cannot call method without setting FMP_CLOUD_API_KEY environment variable'
			);
		}

		const ymdDateStr = getYMDdateString(date);

		const cacheKey = `fmpcloud:eod-prices:${ymdDateStr}`;
		const cachedRecords = await this.cacheManager.get<ICandleDTO[]>(cacheKey);

		const validationResult = v.safeParse(v.array(validCandleDTO), cachedRecords);

		if (validationResult.success) {
			console.log(`using cached FMPCloud daily candles [${ymdDateStr}]`);

			return validationResult.output;
		}

		console.log(`getting new FMPCloud daily candles [${ymdDateStr}]`);

		const endpointURL = this.getRequestUrl('v3/batch-request-end-of-day-prices', {
			date: ymdDateStr
		});
		let candleDTOrecords: ICandleDTO[] = [];

		try {
			const candles = await simpleFetch<IFMPCloudEODRecord[]>(endpointURL, {
				validateSchema: v.array(
					v.object({
						symbol: v.string(),
						date: v.string(),
						open: v.number(),
						high: v.number(),
						low: v.number(),
						close: v.number(),
						adjClose: v.number(),
						volume: v.number()
					})
				),
				responseErrorText: `An error occurred while requesting the EOD prices (${ymdDateStr}) from FMP Cloud`,
				validationErrorText: 'FMPCloud API daily candles response failed schema validation'
			});

			candleDTOrecords = candles.map<ICandleDTO>((record) => ({
				tickerSymbol: record.symbol,
				open: record.open,
				high: record.high,
				low: record.low,
				close: record.adjClose,
				volume: record.volume,
				period: new Date(record.date),
				periodType: ECandlePeriodType.D
			}));

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, records, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return candleDTOrecords;
	}

	async getTradableSymbols(): Promise<IFMPCloudTradableSymbol[]> {
		if (!this.apiKey) {
			throw new Error(
				'Cannot call method without setting FMP_CLOUD_API_KEY environment variable'
			);
		}

		const cacheKey = 'fmpcloud:tradable-symbols';
		const cachedRecords = await this.cacheManager.get<IFMPCloudTradableSymbol[]>(cacheKey);

		const validateCachedRecords = v.safeParse(
			v.array(fmpCloudTradableSymbolItemValidator),
			cachedRecords
		);

		if (validateCachedRecords.success) {
			return validateCachedRecords.output;
		}

		const endpointURL = this.getRequestUrl('v3/available-traded/list');
		let tradableSymbols: IFMPCloudTradableSymbol[] = [];

		try {
			tradableSymbols = await simpleFetch<IFMPCloudTradableSymbol[]>(endpointURL, {
				validateSchema: v.array(fmpCloudTradableSymbolItemValidator),
				responseErrorText:
					'An error occurred while requesting the tradable symbols list from FMP Cloud',
				validationErrorText:
					'FMPCloud API tradable symbols response failed schema validation'
			});

			// disregard any records with an empty name
			tradableSymbols = tradableSymbols.filter(
				(tradableSymbol) => tradableSymbol.name.trim() !== ''
			);

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, tradableSymbols, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return tradableSymbols;
	}

	// NOTE: endpoint no longer available on free plan
	async getStockSplitsForDate(splitDate: Date): Promise<IStockSplitDTO[]> {
		if (!this.apiKey) {
			throw new Error('Cannot call method without setting FMP_API_KEY environment variable');
		}

		const ymdDateStr = getYMDdateString(splitDate);

		const cacheKey = `fmpcloud:stock-splits:${ymdDateStr}`;
		const cachedRecords = await this.cacheManager.get<IStockSplitDTO[]>(cacheKey);

		const validationResult = v.safeParse(v.array(validStockSplitDTO), cachedRecords);

		if (validationResult.success) {
			console.log(`using cached FMPCloud stock split records [${ymdDateStr}]`);

			return validationResult.output;
		}

		console.log(`getting new FMPCloud daily stock splits records [${ymdDateStr}]`);

		const endpointURL = this.getRequestUrl('v3/stock_split_calendar', {
			from: ymdDateStr,
			to: ymdDateStr
		});
		let stockSplitDTOobjects: IStockSplitDTO[] = [];

		try {
			const stockSplitItems = await simpleFetch<IFMPCloudStockSplitCalendarItem[]>(
				endpointURL,
				{
					validateSchema: v.array(
						v.object({
							date: v.string(),
							label: v.string(),
							symbol: v.string(),
							numerator: v.number(),
							denominator: v.number()
						})
					),
					responseErrorText:
						'An error occurred while requesting the stock split calendar from FMP Cloud',
					validationErrorText:
						'FMPCloud API stock splits response failed schema validation'
				}
			);

			stockSplitDTOobjects = stockSplitItems.map((record) => ({
				tickerSymbol: record.symbol,
				from: record.numerator,
				to: record.denominator,
				executionDate: new Date(record.date)
			}));

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, stockSplitDTOobjects, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return stockSplitDTOobjects;
	}

	async getDailyHistoricalData(
		tickerSymbol: string,
		dateParams: { fromDate?: Date; toDate?: Date } = {}
	): Promise<ICandleDTO[]> {
		if (!this.apiKey) {
			throw new Error('Cannot call method without setting FMP_API_KEY environment variable');
		}

		const params: Record<string, string> = {};

		let cacheKey = `fmp:daily-historical:${tickerSymbol}`;
		const cacheKeyDateParts: string[] = [];

		const fromYMD = dateParams?.fromDate ? getYMDdateString(dateParams.fromDate) : '';
		const toYMD = dateParams?.toDate ? getYMDdateString(dateParams.toDate) : '';

		if (fromYMD) {
			params.from = fromYMD;
			cacheKeyDateParts.push(`f${fromYMD}`);
		}

		if (toYMD) {
			params.to = toYMD;
			cacheKeyDateParts.push(`t${toYMD}`);
		}

		if (cacheKeyDateParts.length) {
			cacheKey = `${cacheKey}:${cacheKeyDateParts.join('-')}`;
		}

		const cachedRecords = await this.cacheManager.get<ICandleDTO[]>(cacheKey);

		const validationResult = v.safeParse(v.array(validCandleDTO), cachedRecords);

		if (validationResult.success) {
			return validationResult.output;
		}

		const endpointURL = this.getRequestUrl(`v3/historical-price-full/${tickerSymbol}`, params);
		let candleDTOobjects: ICandleDTO[] = [];

		try {
			const response = await simpleFetch<IFMPCloudHistoricalDataResponse>(endpointURL, {
				validateSchema: v.object({
					symbol: v.string(),
					historical: v.array(
						v.object({
							date: v.string(),
							open: v.number(),
							high: v.number(),
							low: v.number(),
							close: v.number(),
							adjClose: v.number(),
							volume: v.number(),
							unadjustedVolume: v.number()
						})
					)
				}),
				responseErrorText: `An error occurred while requesting daily historical data for ${tickerSymbol} from FMP Cloud`,
				validationErrorText:
					'FMP API daily historical data response failed schema validation'
			});

			candleDTOobjects = response.historical.map((record) => ({
				tickerSymbol: response.symbol.toUpperCase(),
				open: record.open,
				high: record.high,
				low: record.low,
				close: record.adjClose,
				volume: record.volume,
				period: getNYMarketOpenDateObject(record.date),
				periodType: ECandlePeriodType.D
			}));

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, candleDTOobjects, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return candleDTOobjects;
	}

	// NOTE: endpoint no longer available on free plan
	async getEconomicCalendar(
		dateParams: { fromDate?: string; toDate?: string } = {}
	): Promise<IFMPCloudEconomicCalendarItem[]> {
		if (!this.apiKey) {
			throw new Error('Cannot call method without setting FMP_API_KEY environment variable');
		}

		const params: Record<string, string> = {};

		if (dateParams.fromDate && isValidYMDdateString(dateParams.fromDate)) {
			params.from = dateParams.fromDate;
		}

		if (dateParams.toDate && isValidYMDdateString(dateParams.toDate)) {
			params.to = dateParams.toDate;
		}

		const endpointURL = this.getRequestUrl('v3/economic_calendar', params);
		let calendarItems: IFMPCloudEconomicCalendarItem[] = [];

		try {
			calendarItems = await simpleFetch<IFMPCloudEconomicCalendarItem[]>(endpointURL, {
				validateSchema: v.array(fmpCloudEconomicCalendarItemValidator),
				responseErrorText:
					'An error occurred while requesting the economic calendar from FMP Cloud',
				validationErrorText:
					'FMPCloud API economic calendar response failed schema validation'
			});
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return calendarItems;
	}

	async getStockScreenerResults(
		params: TGetStockScreenerResultsParams = {}
	): Promise<IFMPCloudStockScreenerItem[]> {
		if (!this.apiKey) {
			throw new Error('Cannot call method without setting FMP_API_KEY environment variable');
		}

		const reqParams: Record<string, unknown> = {
			isEtf: false,
			isActivelyTrading: true,
			limit: 100000,
			...params
		};

		const cacheKey = `fmpcloud:stock-screener:${generateMD5(JSON.stringify(reqParams))}`;
		const cachedRecords = await this.cacheManager.get<IFMPCloudStockScreenerItem[]>(cacheKey);

		const validateCachedRecords = v.safeParse(
			v.array(fmpCloudStockScreenerItemValidator),
			cachedRecords
		);

		if (validateCachedRecords.success) {
			return validateCachedRecords.output;
		}

		const endpointURL = this.getRequestUrl('v3/stock-screener', reqParams);
		let screenerResults: IFMPCloudStockScreenerItem[] = [];

		try {
			screenerResults = await simpleFetch<IFMPCloudStockScreenerItem[]>(endpointURL, {
				validateSchema: v.array(fmpCloudStockScreenerItemValidator),
				responseErrorText:
					'An error occurred while requesting stock screener data for from FMP Cloud',
				validationErrorText: 'FMPCloud API stock screener response failed schema validation'
			});

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, screenerResults, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return screenerResults;
	}

	async getDefaultExchangesStockScreenerResults(
		params: TGetStockScreenerResultsParams = {}
	): Promise<IFMPCloudStockScreenerItem[]> {
		const nyseRecords = await this.getStockScreenerResults({ ...params, exchange: 'nyse' });
		const nasdaqRecords = await this.getStockScreenerResults({
			...params,
			exchange: 'nasdaq'
		});
		const amexRecords = await this.getStockScreenerResults({ ...params, exchange: 'amex' });

		return [...nyseRecords, ...nasdaqRecords, ...amexRecords];
	}
}

export default FMPCloudClientService;
