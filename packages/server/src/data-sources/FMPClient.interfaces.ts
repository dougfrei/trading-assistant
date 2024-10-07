export interface IFMPEarningsCalendarItem {
	date: string;
	symbol: string;
	eps: number | null;
	epsEstimated: number | null;
	time: string;
	revenue: number | null;
	revenueEstimated: number | null;
	fiscalDateEnding: string;
	updatedFromDate: string;
}

export interface IFMPStockSplitCalendarItem {
	date: string;
	label: string;
	symbol: string;
	numerator: number;
	denominator: number;
}

export interface IFMPExchangeSymbol {
	symbol: string;
	name: string;
	price: number | null;
	changesPercentage: number | null;
	change: number | null;
	dayLow: number | null;
	dayHigh: number | null;
	yearHigh: number | null;
	yearLow: number | null;
	marketCap: number | null;
	priceAvg50: number | null;
	priceAvg200: number | null;
	exchange: string;
	volume: number | null;
	avgVolume: number | null;
	open: number | null;
	previousClose: number | null;
	eps: number | null;
	pe: number | null;
	earningsAnnouncement: string | null;
	sharesOutstanding: number | null;
	timestamp: number;
}

export interface IFMPHistoricalDataItem {
	date: string;
	open: number;
	high: number;
	low: number;
	close: number;
	adjClose: number;
	volume: number;
	unadjustedVolume: number;
	change: number;
	changePercent: number;
	vwap: number;
	label: string;
	changeOverTime: number;
}

export interface IFMPHistoricalDataResponse {
	symbol: string;
	historical: {
		date: string;
		open: number;
		high: number;
		low: number;
		close: number;
		adjClose: number;
		volume: number;
		unadjustedVolume: number;
		change: number;
		changePercent: number;
		vwap: number;
		label: string;
		changeOverTime: number;
	}[];
}

export interface IFMPStockScreenerItem {
	symbol: string;
	companyName: string | null;
	marketCap: number;
	sector: string | null;
	industry: string | null;
	beta: number | null;
	price: number;
	lastAnnualDividend: number | null;
	volume: number;
	exchange: string;
	exchangeShortName: string;
	country: string | null;
	isEtf: boolean;
	isFund: boolean;
	isActivelyTrading: boolean;
}
