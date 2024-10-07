export const gcisSectorETFs: Record<string, string> = {
	'10': 'XLE', // energy
	'15': 'XLB', // materials
	'20': 'XLI', // industrials
	'25': 'XLY', // consumer discretionary
	'30': 'XLP', // consumer staples
	'35': 'XLV', // health care
	'40': 'XLF', // financials
	'45': 'XLK', // technology
	'50': 'XLC', // communication
	'55': 'XLU', // utilities
	'60': 'XLRE' // real estate
};

export const etfTickerSymbols = [
	'SPY', // S&P 500
	'RSP', // S&P 500 equal weighted
	'QQQ', // NASDAQ
	...Object.values(gcisSectorETFs),
	'XBI', // biotech
	'XHB', // homebuilders
	'XME', // metals & mining
	'XOP', // oil & gas
	'XRT', // retail
	'XPH', // pharmaceuticals
	'XSD', // semiconductors

	'GLD', // gold
	'GDX', // gold miners

	'TLT' // 20-year treasury
];

export function getSectorETFTickerSymbolNameByGCIS(gcisValue: string) {
	return gcisSectorETFs[gcisValue.slice(0, 2)] ?? '';
}
