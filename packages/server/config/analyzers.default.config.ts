import { ECandlePeriodType } from '@trading-assistant/common';
import { ATRAnalyzer } from 'src/analysis/analyzers/ATRAnalyzer';
import { EMACrossAnalyzer } from 'src/analysis/analyzers/EMACrossAnalyzer';
import { LRSIAnalyzer } from 'src/analysis/analyzers/LRSIAnalyzer';
import { PriceActionAnalyzer } from 'src/analysis/analyzers/PriceActionAnalyzer';
import { RVolAnalyzer } from 'src/analysis/analyzers/RVolAnalyzer';
import { SMACrossAnalyzer } from 'src/analysis/analyzers/SMACrossAnalyzer';
import { VWRRSAnalyzer } from 'src/analysis/analyzers/VWRRSAnalyzer';
import IAnalyzerGroupParams from 'src/interfaces/IAnalyzerGroupParams';

const analyzers = {
	[ECandlePeriodType.D]: (params: IAnalyzerGroupParams) => [
		new VWRRSAnalyzer({
			indicatorKey: 'vwrrs_market',
			indicatorLabel: 'Volume-weighted Real Relative Strength (Market)',
			refCandles: params.referenceCandles.market
		}),
		// new VWRRSAnalyzer({
		// 	indicatorKey: 'vwrrs_sector',
		// 	indicatorLabel: 'Volume-weighted Real Relative Strength (Sector)',
		// 	refCandles: params.referenceCandles.sector
		// }),
		new SMACrossAnalyzer([50, 100, 200], {
			colorMap: {
				50: '#41E995',
				100: '#DCA96E',
				200: '#2693A7'
			}
		}),
		new EMACrossAnalyzer(10, 20),
		new ATRAnalyzer({ period: 14 }),
		new RVolAnalyzer({ period: 20 }),
		new LRSIAnalyzer({
			fastPeriodGamma: 0.4,
			slowPeriodGamma: 0.7,
			overbought: 0.8,
			oversold: 0.2
		}),
		new PriceActionAnalyzer()
	],
	[ECandlePeriodType.W]: (params: IAnalyzerGroupParams) => [
		new VWRRSAnalyzer({
			indicatorKey: 'vwrrs_market',
			indicatorLabel: 'Volume-weighted Real Relative Strength (Market)',
			refCandles: params.referenceCandles.market
		}),
		// new VWRRSAnalyzer({
		// 	indicatorKey: 'vwrrs_sector',
		// 	indicatorLabel: 'Volume-weighted Real Relative Strength (Sector)',
		// 	refCandles: params.referenceCandles.sector
		// }),
		new EMACrossAnalyzer(6, 12),
		new ATRAnalyzer({ period: 12 }),
		new RVolAnalyzer({ period: 52 }),
		new LRSIAnalyzer({
			fastPeriodGamma: 0.4,
			slowPeriodGamma: 0.7,
			overbought: 0.8,
			oversold: 0.2
		}),
		new PriceActionAnalyzer()
	]
};

export default analyzers;
