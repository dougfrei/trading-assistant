import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ECandlePeriodType, getYMDdateString } from '@trading-assistant/common';
import { URL } from 'node:url';
import {
	IFMPEarningsCalendarItem,
	IFMPExchangeSymbol,
	IFMPHistoricalDataResponse,
	IFMPStockScreenerItem,
	IFMPStockSplitCalendarItem
} from 'src/data-sources/FMPClient.interfaces';
import ICandleDTO, { validCandleDTO } from 'src/interfaces/ICandleDTO';
import IEarningsDTO, { validEarningsDTO } from 'src/interfaces/IEarningsDTO';
import IStockSplitDTO, { validStockSplitDTO } from 'src/interfaces/IStockSplitDTO';
import { SECONDS_24H } from 'src/util/constants';
import { generateMD5 } from 'src/util/crypto';
import { getNYMarketOpenDateObject } from 'src/util/date';
import { getFMPErrorMessage } from 'src/util/fmp/fmp-util';
import {
	fmpCloudStockScreenerItemValidator,
	fmpExchangeSymbolItemValidator
} from 'src/util/fmp/fmp-validators';
import simpleFetch from 'src/util/simple-fetch';
import SimpleFetchResponseError from 'src/util/simple-fetch/SimpleFetchResponseError';
import SimpleFetchValidationError from 'src/util/simple-fetch/SimpleFetchValidationError';
import * as v from 'valibot';

@Injectable()
class FMPClientService {
	private readonly logger = new Logger(FMPClientService.name);

	protected apiKey = '';
	protected apiUrlBase = 'https://financialmodelingprep.com/api';

	constructor(
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		@Inject(ConfigService) private readonly configService: ConfigService
	) {
		const apiKey = this.configService.get('FMP_API_KEY');

		if (typeof apiKey !== 'string') {
			throw new Error('FMP_API_KEY environment variable not set');
		}

		if (!apiKey.trim()) {
			throw new Error('FMP_API_KEY environment variable is not a valid string');
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
	async getEarningsCalendar(startDateStr: string, endDateStr: string): Promise<IEarningsDTO[]> {
		if (!this.apiKey) {
			throw new Error('Cannot call method without setting FMP_API_KEY environment variable');
		}

		const cacheKey = `fmp:earnings:${startDateStr}-${endDateStr}`;
		const cachedRecords = await this.cacheManager.get<IEarningsDTO[]>(cacheKey);

		const validationResult = v.safeParse(v.array(validEarningsDTO), cachedRecords);

		if (validationResult.success) {
			return validationResult.output;
		}

		const endpointURL = this.getRequestUrl('v3/earning_calendar', {
			from: startDateStr,
			to: endDateStr
		});
		let earningsDTOobjects: IEarningsDTO[] = [];

		try {
			const earnings = await simpleFetch<IFMPEarningsCalendarItem[]>(endpointURL, {
				validateSchema: v.array(
					v.object({
						date: v.string(),
						symbol: v.string(),
						eps: v.union([v.number(), v.null()]),
						epsEstimated: v.union([v.number(), v.null()]),
						time: v.string(),
						revenue: v.union([v.number(), v.null()]),
						revenueEstimated: v.union([v.number(), v.null()]),
						fiscalDateEnding: v.string(),
						updatedFromDate: v.string()
					})
				),
				responseErrorText:
					'An error occurred while requesting the earnings calendar from FMP',
				validationErrorText: 'FMP API earnings calendar response failed schema validation'
			});

			earningsDTOobjects = earnings.map<IEarningsDTO>((record) => ({
				date: new Date(record.date),
				tickerSymbol: record.symbol,
				eps: record.eps,
				epsEstimated: record.epsEstimated,
				revenue: record.revenue,
				revenueEstimated: record.revenueEstimated,
				announceTime: record.time === 'bmo' ? 'bmo' : 'amc',
				fiscalDateEnding: new Date(record.fiscalDateEnding),
				updatedFromDate: new Date(record.updatedFromDate)
			}));

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, earningsDTOobject, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return earningsDTOobjects;
	}

	// NOTE: endpoint no longer available on free plan
	async getStockSplitCalendar(startDate: Date, endDate: Date): Promise<IStockSplitDTO[]> {
		if (!this.apiKey) {
			throw new Error('Cannot call method without setting FMP_API_KEY environment variable');
		}

		const startDateYMD = getYMDdateString(startDate);
		const endDateYMD = getYMDdateString(endDate);

		const cacheKey = `fmp:stock-splits:${startDateYMD}-${endDateYMD}`;
		const cachedRecords = await this.cacheManager.get<IStockSplitDTO[]>(cacheKey);

		const validationResult = v.safeParse(v.array(validStockSplitDTO), cachedRecords);

		if (validationResult.success) {
			return validationResult.output;
		}

		const endpointURL = this.getRequestUrl('v3/stock_split_calendar', {
			from: startDateYMD,
			to: endDateYMD
		});
		let stockSplitDTOobjects: IStockSplitDTO[] = [];

		try {
			const stockSplits = await simpleFetch<IFMPStockSplitCalendarItem[]>(endpointURL, {
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
					'An error occurred while requesting the stock split calendar from FMP',
				validationErrorText: 'FMP API stock split response failed schema validation'
			});

			stockSplitDTOobjects = stockSplits.map((record) => ({
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

	async getExchangeSymbols(exchange: string): Promise<IFMPExchangeSymbol[]> {
		if (!this.apiKey) {
			throw new Error('Cannot call method without setting FMP_API_KEY environment variable');
		}

		exchange = exchange.toUpperCase();

		const cacheKey = `fmp:exchange-symbols:${exchange}`;
		const cachedRecords = await this.cacheManager.get(cacheKey);

		const validateCachedRecords = v.safeParse(
			v.array(fmpExchangeSymbolItemValidator),
			cachedRecords
		);

		if (validateCachedRecords.success) {
			console.log(`using cached FMP exchange symbols [${exchange}]`);
			return validateCachedRecords.output;
		}

		console.log(`getting new FMP exchange symbols [${exchange}]`);

		const endpointURL = this.getRequestUrl(`v3/symbol/${exchange}`);
		let exchangeSymbols: IFMPExchangeSymbol[] = [];

		try {
			exchangeSymbols = await simpleFetch<IFMPExchangeSymbol[]>(endpointURL, {
				validateSchema: v.array(fmpExchangeSymbolItemValidator),
				responseErrorText: `An error occurred while requesting ${exchange} exchange symbols from FMP`,
				validationErrorText: 'FMP API exchange symbols response failed schema validation'
			});

			// disregard any records with an empty name
			exchangeSymbols = exchangeSymbols.filter(
				(exchangeSymbol) => exchangeSymbol.name.trim() !== ''
			);

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, exchangeSymbols, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return exchangeSymbols;
	}

	async getDailyHistoricalData(
		tickerSymbol: string,
		dateParams: { fromDate?: Date; toDate?: Date } = {}
	): Promise<ICandleDTO[]> {
		if (!this.apiKey) {
			throw new Error('Cannot call method without setting FMP_API_KEY environment variable');
		}

		const params: Record<string, unknown> = {};

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

		const validateCachedRecords = v.safeParse(v.array(validCandleDTO), cachedRecords);

		if (validateCachedRecords.success) {
			return validateCachedRecords.output;
		}

		const endpointURL = this.getRequestUrl(`v3/historical-price-full/${tickerSymbol}`, params);
		let candleDTOobjects: ICandleDTO[] = [];

		try {
			const apiResponse = await simpleFetch<IFMPHistoricalDataResponse>(endpointURL, {
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
				responseErrorText: `An error occurred while requesting daily historical data for ${tickerSymbol} from FMP`,
				validationErrorText:
					'FMP API daily historical data response failed schema validation'
			});

			candleDTOobjects = apiResponse.historical.map((record) => ({
				tickerSymbol: apiResponse.symbol.toUpperCase(),
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

	async getStockScreenerResults(
		params: {
			isEtf?: boolean;
			isActivelyTrading?: boolean;
			limit?: number;
			exchange?: string;
		} = {}
	): Promise<IFMPStockScreenerItem[]> {
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
		const cachedRecords = await this.cacheManager.get<IFMPStockScreenerItem[]>(cacheKey);

		const validateCachedRecords = v.safeParse(
			v.array(fmpCloudStockScreenerItemValidator),
			cachedRecords
		);

		if (validateCachedRecords.success) {
			console.log('using cached FMP stock screener results');
			return validateCachedRecords.output;
		}

		console.log(`getting new FMP stock screener results [${reqParams.exchange ?? ''}]`);

		const endpointURL = this.getRequestUrl('v3/stock-screener', reqParams);

		let screenerResults: IFMPStockScreenerItem[] = [];

		try {
			screenerResults = await simpleFetch<IFMPStockScreenerItem[]>(endpointURL, {
				validateSchema: v.array(fmpCloudStockScreenerItemValidator),
				responseErrorText:
					'An error occurred while requesting stock screener data for from FMP',
				validationErrorText: 'FMP API stock screener response failed schema validation'
			});

			// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
			await this.cacheManager.set(cacheKey, screenerResults, { ttl: SECONDS_24H });
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return screenerResults;
	}
}

export default FMPClientService;
