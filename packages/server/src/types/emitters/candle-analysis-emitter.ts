import { ECandlePeriodType } from '@trading-assistant/common';

type TCandleAnalysisEmitter = {
	'analysis:start': { totalCount: number };
	'analysis:end': { totalCount: number };
	'analysis:process-ticker-symbol': {
		tickerSymbol: string;
		currentIndex: number;
		totalCount: number;
	};
	'analysis:error': {
		message: string;
		tickerSymbol: string;
		periodType: ECandlePeriodType;
	};
	'analysis:benchmarks': {
		tickerSymbolName: string;
		periodType: ECandlePeriodType;
		analyze: number;
		dbUpdate: number;
		total: number;
	};
	'analysis:debug': { tickerSymbolName: string; periodType: ECandlePeriodType; message: string };
};

export default TCandleAnalysisEmitter;
