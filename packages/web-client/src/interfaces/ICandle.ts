import { ECandlePeriodType } from '@trading-assistant/common/enums';

interface ICandle {
	period: number;
	periodType: ECandlePeriodType;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	indicators: Record<string, number | null>;
	alerts: string[];
}

export default ICandle;
