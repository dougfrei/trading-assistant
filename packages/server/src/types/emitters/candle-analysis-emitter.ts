import { ECandlePeriodType } from '@trading-assistant/common';

type TCandleAnalysisEmitter = {
	'analysis:start': { totalCount: number };
	'analysis:end': { totalCount: number };
	'analysis:process-ticker-symbol': {
		tickerSymbolName: string;
		currentIndex: number;
		totalCount: number;
	};
	'analysis:error': {
		message: string;
		tickerSymbolName?: string;
		periodType?: ECandlePeriodType;
	};
	'analysis:debug': {
		message: string;
		tickerSymbolName?: string;
		periodType?: ECandlePeriodType;
	};
};

export default TCandleAnalysisEmitter;
