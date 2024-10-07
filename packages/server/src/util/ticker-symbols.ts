import { TickerSymbol } from 'src/entities/TickerSymbol.model';

/**
 * Return a ticker symbol name map object from the provided TickerSymbol entity object array
 *
 * @param tickerSymbols Array of TickerSymbol entity objects
 * @returns Map with ticker symbol name keys containing the related TickerSymbol records
 */
export function getTickerSymbolNameMap(tickerSymbols: TickerSymbol[]) {
	const returnMap = new Map<string, TickerSymbol>();

	tickerSymbols.forEach((tickerSymbol) => {
		returnMap.set(tickerSymbol.name, tickerSymbol);
	});

	return returnMap;
}
