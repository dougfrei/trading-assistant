import { Candle } from 'src/entities/Candle.model';
import {
	ICandleAnalyzerAlertType,
	ICandleAnalyzerChartSeriesGroup,
	ICandleAnalyzerChartType,
	ICandleAnalyzerIndicatorType
} from 'src/interfaces/ICandleAnalyzer';

class BaseAnalyzer {
	getIndicatorTypes(): ICandleAnalyzerIndicatorType[] {
		return [];
	}

	getAlertTypes(): ICandleAnalyzerAlertType[] {
		return [];
	}

	getMainChartSeriesGroups(): ICandleAnalyzerChartSeriesGroup[] {
		return [];
	}

	getVolumeChartSeriesGroups(): ICandleAnalyzerChartSeriesGroup[] {
		return [];
	}

	getChartTypes(): ICandleAnalyzerChartType[] {
		return [];
	}

	analyze(candles: Candle[]): Candle[] {
		return candles;
	}

	getMinimumRequiredCandles() {
		return 1;
	}
}

export default BaseAnalyzer;
