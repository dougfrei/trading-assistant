import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ECandlePeriodType, getYMDdateString } from '@trading-assistant/common';
import { eachDayOfInterval } from 'date-fns';
import { URL } from 'node:url';
import { Candle } from 'src/entities/Candle.model';
import IAlpacaCalendarEntry from 'src/interfaces/IAlpacaCalendarEntry';
import IMarketHolidayDTO, { validMarketHolidayDTO } from 'src/interfaces/IMarketHolidayDTO';
import { SECONDS_24H } from 'src/util/constants';
import simpleFetch from 'src/util/simple-fetch';
import SimpleFetchResponseError from 'src/util/simple-fetch/SimpleFetchResponseError';
import SimpleFetchValidationError from 'src/util/simple-fetch/SimpleFetchValidationError';
import * as v from 'valibot';
import { IAlpacaMultiBarsResponse } from './AlpacaClient.interfaces';

@Injectable()
class AlpacaClientService {
	private readonly logger = new Logger(AlpacaClientService.name);

	protected apiKey = '';
	protected apiSecret = '';
	protected apiLiveMode = false;

	constructor(
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		@Inject(ConfigService) private readonly configService: ConfigService
	) {
		const apiKey = this.configService.get('ALPACA_API_KEY');
		const apiSecret = this.configService.get('ALPACA_API_SECRET');

		if (typeof apiKey !== 'string') {
			throw new Error('ALPACA_API_KEY environment variable not set');
		}

		if (!apiKey.trim()) {
			throw new Error('ALPACA_API_KEY environment variable is not a valid string');
		}

		if (typeof apiSecret !== 'string') {
			throw new Error('ALPACA_API_SECRET environment variable not set');
		}

		if (!apiSecret.trim()) {
			throw new Error('ALPACA_API_SECRET environment variable is not a valid string');
		}

		this.apiKey = apiKey;
		this.apiSecret = apiSecret;
		this.apiLiveMode = this.configService.get('ALPACA_API_LIVE_MODE') ?? false;
	}

	protected get tradingApiUrlBase() {
		return `https://${this.apiLiveMode ? 'api' : 'paper-api'}.alpaca.markets`;
	}

	protected getAuthHeaders(): Record<string, string> {
		return {
			'APCA-API-KEY-ID': this.apiKey,
			'APCA-API-SECRET-KEY': this.apiSecret
		};
	}

	protected getTradingRequestURL(endpoint: string, params: Record<string, string> = {}): string {
		const url = new URL(`${this.tradingApiUrlBase}/${endpoint}`);

		url.searchParams.append('apiKey', this.apiKey);

		for (const paramKey in params) {
			url.searchParams.append(paramKey, params[paramKey]);
		}

		return url.toString();
	}

	protected getDataRequestURL(endpoint: string, params: Record<string, string> = {}): string {
		const url = new URL(`https://data.alpaca.markets/${endpoint}`);

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

	async getMultiTickerCandles(
		symbols: string[],
		params: {
			periodType?: ECandlePeriodType;
			start?: string | Date;
			end?: string | Date;
			feed?: 'sip' | 'iex';
			limit?: number;
			pageToken?: string;
		} = {}
	): Promise<Map<string, Candle[]>> {
		const {
			periodType = 'D',
			start = '',
			end = '',
			feed = 'sip',
			limit = 1000,
			pageToken = ''
		} = params;

		if (!this.apiKey || !this.apiSecret) {
			throw new Error(
				'Cannot call method without setting ALPACA_API_KEY and ALPACA_API_SECRET environment variables'
			);
		}

		let timeframe = '1Day';

		switch (periodType) {
			case ECandlePeriodType.M1:
				timeframe = '1Min';
				break;

			case ECandlePeriodType.M5:
				timeframe = '5Min';
				break;

			case ECandlePeriodType.M15:
				timeframe = '15Min';
				break;

			case ECandlePeriodType.M30:
				timeframe = '30Min';
				break;

			case ECandlePeriodType.H:
				timeframe = '1Hour';
				break;

			case ECandlePeriodType.D:
				timeframe = '1Day';
				break;

			case ECandlePeriodType.W:
				timeframe = '1Week';
				break;

			default:
				break;
		}

		const reqParams: Record<string, string> = {
			symbols: symbols.map((symbol) => symbol.trim().toUpperCase()).join(','),
			timeframe,
			feed: feed.toLowerCase(),
			limit: limit.toString()
		};

		if (start) {
			reqParams.start = start instanceof Date ? start.toISOString() : start;
		}

		if (end) {
			reqParams.end = end instanceof Date ? end.toISOString() : end;
		}

		if (pageToken) {
			reqParams.page_token = pageToken;
		}

		const endpointURL = this.getDataRequestURL('v2/stocks/bars', reqParams);
		const tickerGroups = new Map<string, Candle[]>();

		try {
			const response = await simpleFetch<IAlpacaMultiBarsResponse>(endpointURL, {
				fetchOpts: {
					headers: this.getAuthHeaders()
				},
				validateSchema: v.object({
					bars: v.record(
						v.string(),
						v.array(
							v.object({
								o: v.number(),
								h: v.number(),
								l: v.number(),
								c: v.number(),
								v: v.number(),
								t: v.string()
							})
						)
					),
					next_page_token: v.union([v.string(), v.null()])
				}),
				responseErrorText:
					'An error occurred while getting multi-ticker candles from Alpaca.',
				validationErrorText: 'Alpaca API multi-ticker response failed schema validation'
			});

			symbols.forEach((symbol) => {
				if (typeof response.bars[symbol] === 'undefined') {
					return;
				}

				const candles = response.bars[symbol].map(
					(candle) =>
						new Candle({
							open: candle.o,
							high: candle.h,
							low: candle.l,
							close: candle.c,
							volume: candle.v,
							period: new Date(candle.t),
							periodType: params.periodType
						})
				);

				tickerGroups.set(symbol, candles);
			});
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return tickerGroups;
	}

	async getCalendar(params: { startDate?: Date; endDate?: Date } = {}) {
		const reqParams: Record<string, string> = {};
		const cacheKeyParts: string[] = [];
		let cacheKey = '';

		if (params.startDate) {
			reqParams.start = getYMDdateString(params.startDate);
			cacheKeyParts.push(`s${reqParams.start}`);
		}

		if (params.endDate) {
			reqParams.end = getYMDdateString(params.endDate);
			cacheKeyParts.push(`e${reqParams.end}`);
		}

		if (cacheKeyParts.length) {
			cacheKey = `alpaca:calendar:${cacheKeyParts.join('-')}`;

			const cachedRecords = await this.cacheManager.get<IMarketHolidayDTO[]>(cacheKey);

			const validateCachedRecords = v.safeParse(
				v.array(validMarketHolidayDTO),
				cachedRecords
			);

			if (validateCachedRecords.success) {
				return validateCachedRecords.output;
			}
		}

		const endpointURL = this.getTradingRequestURL('v2/calendar', reqParams);
		let marketHolidayDTOobjects: IMarketHolidayDTO[] = [];

		try {
			const calendarRecords = await simpleFetch<IAlpacaCalendarEntry[]>(endpointURL, {
				fetchOpts: {
					headers: this.getAuthHeaders()
				},
				validateSchema: v.array(
					v.object({
						date: v.string(),
						open: v.string(),
						close: v.string(),
						session_open: v.string(),
						session_close: v.string(),
						settlement_date: v.string()
					})
				),
				responseErrorText: 'An error occurred while market calendar data for from Alpaca',
				validationErrorText: 'Alpaca API market calendar response failed schema validation'
			});

			if (!calendarRecords.length) {
				return marketHolidayDTOobjects;
			}

			// create a calendar records map with date keys for quick lookups
			// when iterating over the date intervals below
			const calendarRecordsMap = new Map(
				calendarRecords.map((record) => [record.date, record])
			);

			// get the first/last record dates from the API response array
			const firstRecordDate = new Date(`${calendarRecords[0].date}T00:00:00`);
			const lastRecordDate = new Date(
				`${calendarRecords[calendarRecords.length - 1].date}T00:00:00`
			);

			marketHolidayDTOobjects = eachDayOfInterval({
				start: firstRecordDate,
				end: lastRecordDate
			}).reduce<IMarketHolidayDTO[]>((acum, curDate) => {
				// skip if the current date interval is a saturday or sunday
				if ([0, 6].includes(curDate.getDay())) {
					return acum;
				}

				const curDateYMD = getYMDdateString(curDate);

				if (calendarRecordsMap.has(curDateYMD)) {
					// check for an early close if the calendar records map has an entry for the current date
					if (calendarRecordsMap.get(curDateYMD)?.close !== '16:00') {
						acum.push({ dateYMD: curDateYMD, isEarlyClose: true });
					}
				} else {
					// the market is closed if there is no entry in the calendar records map
					acum.push({ dateYMD: curDateYMD, isEarlyClose: false });
				}

				return acum;
			}, []);

			if (cacheKey) {
				// @ts-expect-error @types/cache-manager@4 are not valid for cache-manager@5 and TTL must be specified in an object as seconds
				await this.cacheManager.set(cacheKey, marketHolidayDTOobjects, {
					ttl: SECONDS_24H
				});
			}
		} catch (err: unknown) {
			await this.handleError(err, endpointURL);
		}

		return marketHolidayDTOobjects;
	}
}

export default AlpacaClientService;
