// reference: https://en.wikipedia.org/wiki/Option_naming_convention
//
import { format } from 'date-fns';

interface IEncodeOptionNameParams {
	tickerSymbol: string;
	expirationDate: Date | string;
	type: 'CALL' | 'PUT';
	strike: number;
}

export interface IDecodedOptionName {
	tickerSymbol: string;
	expirationDate: string;
	type: 'CALL' | 'PUT';
	strike: number;
}

/**
 * Encodes an option name from the params in the provided object
 *
 * @param {IDecodedOptionName} params - An object containing the option values
 * @returns {string} The encoded option name
 *
 * @throws {Error} Throws exception if the ticker symbol, expiration date, or strike price are invalid
 */
export function encodeOptionName(params: IEncodeOptionNameParams): string {
	if (params.tickerSymbol.length > 6) {
		throw new Error(`ticker symbol may not be longer than 6 characters: ${params.tickerSymbol}`);
	}

	const dateTimestamp =
		params.expirationDate instanceof Date
			? params.expirationDate.getTime()
			: Date.parse(`${params.expirationDate}T00:00:00`);

	if (isNaN(dateTimestamp)) {
		throw new Error(
			`invalid expiration date provided (should be a string in YYYY-MM-DD format or a Date object): ${params.expirationDate}`
		);
	}

	const dateStr = format(dateTimestamp, 'yyMMdd');

	if (dateStr.length !== 6) {
		throw new Error(
			`invalid expiration date provided (should be a string in YYYY-MM-DD format or a Date object): ${params.expirationDate}`
		);
	}

	if (params.strike > 99999.999 || params.strike < 0) {
		throw new Error(`invalid strike provided: ${params.strike}`);
	}

	const strikeValueStr = Math.round(params.strike * 1000).toString();
	const strikePaddedStr = strikeValueStr.padStart(8, '0');

	return params.tickerSymbol.toUpperCase() + dateStr + (params.type === 'CALL' ? 'C' : 'P') + strikePaddedStr;
}

/**
 * Parses an encoded option name (ex: SPY240627C00555000) into separate parts
 *
 * @param optionName - The encoded option name
 * @returns An object with the decoded option parameters
 *
 * @throws {Error} Throws exception if the option name or date is invalid
 */
export function decodeOptionName(optionName: string): IDecodedOptionName {
	if (optionName.length > 21) {
		throw new Error(`invalid option name (over 21 characters): ${optionName}`);
	}

	const matcher = /([\w ]{1,6})(\d{2})(\d{2})(\d{2})([PC])(\d{8})/g;

	const matches = Array.from(optionName.toUpperCase().matchAll(matcher))[0] ?? [];

	if (!matches.length) {
		throw new Error(`invalid option name (could not match): ${optionName}`);
	}

	const [, tickerSymbol, year, month, day, optionType, strike] = matches;

	const decoded: IDecodedOptionName = {
		tickerSymbol,
		expirationDate: `20${year}-${month}-${day}`,
		type: optionType === 'C' ? 'CALL' : 'PUT',
		strike: parseFloat(strike) / 1000
	};

	if (isNaN(Date.parse(decoded.expirationDate))) {
		throw new Error(`invalid date in option name: ${optionName}`);
	}

	return decoded;
}
