export enum EAVWAPType {
	EARNINGS = 'earnings',
	TRIPLE_WITCHING = 'triple_witching',
	HIGH_VOLUME = 'high_volume',
	RELATIVE_HIGH = 'relative_high',
	RELATIVE_LOW = 'relative_low',
	OTHER = 'other'
}

export enum ECandlePeriodType {
	M1 = 'M1',
	M5 = 'M5',
	M15 = 'M15',
	M30 = 'M30',
	H = 'H',
	D = 'D',
	W = 'W',
	M = 'M',
	Y = 'Y'
}

export enum ECandleRelativeValueType {
	STRENGTH_WEAKNESS = 'STRENGTH_WEAKNESS',
	VOLUME = 'VOLUME'
}

export enum ECandleSortOrder {
	PERIOD_ASC = 'PERIOD_ASC',
	PERIOD_DESC = 'PERIOD_DESC'
}

export enum ETradeSide {
	BUY = 'BUY',
	SELL = 'SELL'
}

export enum ETickerSymbolType {
	stock = 'stock',
	ETF = 'ETF'
}

export enum ETradeTagType {
	SETUP = 'SETUP',
	REVIEW = 'REVIEW'
}

export enum ETradeOptionType {
	CALL = 'CALL',
	PUT = 'PUT'
}

export enum ETradeInstrumentType {
	STOCK = 'STOCK',
	OPTION = 'OPTION',
	FUTURES = 'FUTURES',
	CRYPTO = 'CRYPTO'
}

export enum ETradeNoteType {
	SETUP = 'SETUP',
	REVIEW = 'REVIEW',
	GENERAL = 'GENERAL'
}
