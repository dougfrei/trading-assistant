export interface IFMPCloudEODRecord {
	symbol: string;
	date: string;
	open: number;
	low: number;
	high: number;
	close: number;
	adjClose: number;
	volume: number;
}

export interface IFMPCloudTradableSymbol {
	symbol: string;
	name: string;
	price: number;
	exchange: string;
	exchangeShortName: string;
	type: string;
}

export interface IFMPCloudStockSplitCalendarItem {
	date: string;
	label: string;
	symbol: string;
	numerator: number;
	denominator: number;
}

export interface IFMPCloudHistoricalDataItem {
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

export interface IFMPCloudHistoricalDataResponse {
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

export interface IFMPCloudEconomicCalendarItem {
	date: string;
	country: string;
	event: string;
	currency: string;
	previous: number | null;
	estimate: number | null;
	actual: number | null;
	change: number;
	impact: string;
	changePercentage: number;
}

export interface IFMPCloudStockScreenerItem {
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
