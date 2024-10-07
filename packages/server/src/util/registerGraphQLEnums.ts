import { registerEnumType } from '@nestjs/graphql';
import {
	EAVWAPType,
	ECandlePeriodType,
	ECandleSortOrder,
	ETickerSymbolType,
	ETradeInstrumentType,
	ETradeNoteType,
	ETradeOptionType,
	ETradeTagType
} from '@trading-assistant/common';
import ECandleRSRWCompareWith from 'src/enums/ECandleRSRWCompareWith';
import EScreenerSortMethod from 'src/enums/EScreenerSortMethod';
import ESectorsSortMethod from 'src/enums/ESectorsSortMethod';
import ETickerSymbolsSortMethod from 'src/enums/ETickerSymbolsSortMethod';
import ETradePeriodType from 'src/enums/ETradePerformancePeriodType';

/**
 * Takes the enums used by the application and makes them available in the
 * generated GraphQL schema
 */
export function registerGraphQLEnums() {
	registerEnumType(ECandlePeriodType, {
		name: 'ECandlePeriodType'
	});

	registerEnumType(ECandleRSRWCompareWith, {
		name: 'ECandleRSRWCompareWith'
	});

	registerEnumType(ECandleSortOrder, {
		name: 'ECandleSortOrder'
	});

	registerEnumType(ETickerSymbolType, {
		name: 'ETickerSymbolType'
	});

	registerEnumType(ETradeOptionType, {
		name: 'ETradeOptionType'
	});

	registerEnumType(ETradePeriodType, {
		name: 'ETradePeriodType'
	});

	registerEnumType(ETradeTagType, {
		name: 'ETradeTagType'
	});

	registerEnumType(ETradeInstrumentType, {
		name: 'ETradeInstrumentType'
	});

	registerEnumType(ETradeNoteType, {
		name: 'ETradeNoteType'
	});

	registerEnumType(EAVWAPType, {
		name: 'EAVWAPType'
	});

	registerEnumType(EScreenerSortMethod, {
		name: 'EScreenerSortMethod'
	});

	registerEnumType(ESectorsSortMethod, {
		name: 'ESectorsSortMethod'
	});

	registerEnumType(ETickerSymbolsSortMethod, {
		name: 'ETickerSymbolsSortMethod'
	});
}
