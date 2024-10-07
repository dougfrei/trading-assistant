import { Candle } from 'src/entities/Candle.model';
import { TickerSymbol } from 'src/entities/TickerSymbol.model';

interface IScreenerRecord {
	tickerSymbol: TickerSymbol;
	lastCandle: Candle;
	meta: {
		change: number;
	};
}

export default IScreenerRecord;
