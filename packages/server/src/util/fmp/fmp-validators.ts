import * as v from 'valibot';

export const fmpCloudStockScreenerItemValidator = v.object({
	symbol: v.string(),
	companyName: v.union([v.string(), v.null()]),
	marketCap: v.number(),
	sector: v.union([v.string(), v.null()]),
	industry: v.union([v.string(), v.null()]),
	beta: v.union([v.number(), v.null()]),
	price: v.number(),
	lastAnnualDividend: v.union([v.number(), v.null()]),
	volume: v.number(),
	exchange: v.string(),
	exchangeShortName: v.string(),
	country: v.union([v.string(), v.null()]),
	isEtf: v.boolean(),
	isFund: v.optional(v.boolean(), false),
	isActivelyTrading: v.boolean()
});

export const fmpCloudEconomicCalendarItemValidator = v.object({
	date: v.string(),
	country: v.string(),
	event: v.string(),
	currency: v.string(),
	previous: v.union([v.number(), v.null()]),
	estimate: v.union([v.number(), v.null()]),
	actual: v.union([v.number(), v.null()]),
	change: v.number(),
	impact: v.string(),
	changePercentage: v.number()
});

export const fmpCloudTradableSymbolItemValidator = v.object({
	symbol: v.string(),
	name: v.optional(v.pipe(v.unknown(), v.transform(String)), ''),
	price: v.number(),
	exchange: v.optional(v.pipe(v.unknown(), v.transform(String)), ''),
	exchangeShortName: v.optional(v.pipe(v.unknown(), v.transform(String)), ''),
	type: v.string()
});

export const fmpExchangeSymbolItemValidator = v.object({
	symbol: v.string(),
	name: v.optional(v.pipe(v.unknown(), v.transform(String)), ''),
	price: v.union([v.number(), v.null()]),
	changesPercentage: v.union([v.number(), v.null()]),
	change: v.union([v.number(), v.null()]),
	dayLow: v.union([v.number(), v.null()]),
	dayHigh: v.union([v.number(), v.null()]),
	yearHigh: v.union([v.number(), v.null()]),
	yearLow: v.union([v.number(), v.null()]),
	marketCap: v.union([v.number(), v.null()]),
	priceAvg50: v.union([v.number(), v.null()]),
	priceAvg200: v.union([v.number(), v.null()]),
	exchange: v.string(),
	volume: v.union([v.number(), v.null()]),
	avgVolume: v.union([v.number(), v.null()]),
	open: v.union([v.number(), v.null()]),
	previousClose: v.union([v.number(), v.null()]),
	eps: v.union([v.number(), v.null()]),
	pe: v.union([v.number(), v.null()]),
	earningsAnnouncement: v.union([v.string(), v.null()]),
	sharesOutstanding: v.union([v.number(), v.null()]),
	timestamp: v.number()
});
