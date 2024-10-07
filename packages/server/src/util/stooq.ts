import { ECandlePeriodType, getYMDdateString } from '@trading-assistant/common';
import { parse } from 'csv-parse/sync';
import { basename } from 'node:path';
import { Candle } from 'src/entities/Candle.model';
import { getCandlesHighLowValues } from 'src/util/candle';
import { twoDecimals } from 'src/util/math';
import { DEFAULT_MARKET_TICKER_SYMBOL } from './constants';
import { getNYMarketOpenDateObject } from './date';

import AdmZip = require('adm-zip'); /* eslint-disable-line @typescript-eslint/no-require-imports */

export function parseStooqDateString(date: string): string {
	const sanitized = date.match(/\d+/g)?.join('');

	if (!sanitized || sanitized.length !== 8) {
		return '';
	}

	const year = sanitized.substring(0, 4);
	const month = sanitized.substring(4, 6);
	const day = sanitized.substring(6, 8);

	return `${year}-${month}-${day}`;
}

export function parseStooqTimeString(time: string): string {
	const sanitized = time.match(/\d+/g)?.join('');

	if (!sanitized || sanitized.length !== 6) {
		return '';
	}

	const hour = sanitized.substring(0, 2);
	const min = sanitized.substring(2, 4);
	const sec = sanitized.substring(4, 6);

	return `${hour}:${min}:${sec}`;
}

export function getStooqCSVrecordDateObject(
	dateStr: string,
	timeStr: string,
	opts: { isDay: boolean } = { isDay: false }
): Date | null {
	const datePart = parseStooqDateString(dateStr);
	const timePart = opts.isDay ? '09:30:00' : parseStooqTimeString(timeStr);

	if (!datePart || !timePart) {
		return null;
	}

	return opts.isDay
		? getNYMarketOpenDateObject(datePart)
		: new Date(`${datePart}T${timePart}.000Z`);
}

interface IStooqCSVparseResultTicker {
	candles: Candle[];
	errors: string[];
	at_h: number;
	at_l: number;
}

export interface IStooqCSVparseResult {
	tickers: Record<string, IStooqCSVparseResultTicker>;
	errors: string[];
}

export function parseStooqCSVcontent(
	csvContent: string,
	opts: { limitCount?: number; singleTicker?: string; calcHighLow?: boolean } = {
		limitCount: 0,
		singleTicker: '',
		calcHighLow: false
	}
): IStooqCSVparseResult {
	const res: IStooqCSVparseResult = {
		tickers: {},
		errors: []
	};

	const records = parse(csvContent, { skip_empty_lines: true, from_line: 2 });

	if (!Array.isArray(records)) {
		res.errors.push('unable to parse content as CSV');

		return res;
	}

	records.forEach((record) => {
		const [rawTickerSymbol, period, date, time, open, high, low, close, volume] = record;

		const tickerSymbol = rawTickerSymbol.toUpperCase().replace('.US', '');

		// skip the line if no ticker is specified OR if we're looking for
		// a single ticker and this line is not a match
		if (!tickerSymbol || (opts.singleTicker && opts.singleTicker !== tickerSymbol)) {
			return;
		}

		if (typeof res.tickers[tickerSymbol] === 'undefined') {
			res.tickers[tickerSymbol] = {
				candles: [],
				errors: [],
				at_h: 0,
				at_l: 0
			};
		}

		let timestamp: Date | null = null;
		let periodType = '';

		switch (period.toLowerCase()) {
			case 'd':
				timestamp = getStooqCSVrecordDateObject(date, time, { isDay: true });
				periodType = ECandlePeriodType.D;
				break;

			case '5':
				timestamp = getStooqCSVrecordDateObject(date, time);
				periodType = ECandlePeriodType.M5;
				break;

			default:
				break;
		}

		if (!timestamp) {
			res.errors.push(`timestamp parsing error: ${tickerSymbol}, ${date}, ${time}`);
			return;
		}

		if (!periodType) {
			res.errors.push(`period length parsing error: ${tickerSymbol}, ${period}`);
			return;
		}

		const candleObj = new Candle({
			period: timestamp,
			periodType: periodType as ECandlePeriodType,
			open: twoDecimals(parseFloat(open)),
			high: twoDecimals(parseFloat(high)),
			low: twoDecimals(parseFloat(low)),
			close: twoDecimals(parseFloat(close)),
			volume: parseInt(volume)
		});

		res.tickers[tickerSymbol].candles.push(candleObj);
	});

	for (const ticker in res.tickers) {
		// calculate all-time high/low if needed
		if (opts.calcHighLow) {
			const highLow = getCandlesHighLowValues(res.tickers[ticker].candles);

			res.tickers[ticker].at_l = highLow.low;
			res.tickers[ticker].at_h = highLow.high;
		}

		// limit candles length if needed
		const candlesLength = res.tickers[ticker].candles.length;

		if (opts.limitCount && res.tickers[ticker].candles.length > opts.limitCount) {
			res.tickers[ticker].candles = res.tickers[ticker].candles.slice(
				candlesLength - opts.limitCount
			);
		}
	}

	return res;
}

/**
 * Checks the uploaded files for the market reference ticker (default is SPY)
 * and returns the date of the most recent row in "YYYY-MM-DD" format
 *
 * @param filePaths string[]
 * @returns string
 */
export function getStooqArchiveMostRecentDate(
	zipEntries: TStooqZipEntries,
	tickerSymbol = DEFAULT_MARKET_TICKER_SYMBOL
): string {
	const refEntry = zipEntries.get(tickerSymbol.toUpperCase());

	if (!refEntry) {
		throw new Error(`Unable to find ${tickerSymbol.toUpperCase()} ticker file`);
	}

	const parseRes = parseStooqCSVcontent(refEntry.getData().toString('utf-8'), { limitCount: 1 });
	const candles = parseRes?.tickers[tickerSymbol.toUpperCase()]?.candles ?? null;

	if (!Array.isArray(candles) || !candles.length) {
		throw new Error(
			`Parsed ${tickerSymbol.toUpperCase()} ticker file does not contain any ${tickerSymbol.toUpperCase()} rows`
		);
	}

	return getYMDdateString(candles[0].period);
}

export type TStooqZipEntries = Map<string, AdmZip.IZipEntry>;

export function getStooqZipEntries(zipFile: string) {
	const zip = new AdmZip(zipFile);
	const entries = zip.getEntries();

	return entries.reduce((acum, entry) => {
		if (entry.isDirectory) {
			return acum;
		}

		const mapKey = basename(entry.entryName, '.us.txt').toUpperCase();

		if (acum.has(mapKey)) {
			return acum;
		}

		acum.set(mapKey, entry);

		return acum;
	}, new Map<string, AdmZip.IZipEntry>());
}
