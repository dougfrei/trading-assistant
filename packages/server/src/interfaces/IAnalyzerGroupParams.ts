import { Candle } from 'src/entities/Candle.model';

interface IAnalyzerGroupParams {
	referenceCandles: {
		market: Candle[];
		sector: Candle[];
	};
}

export default IAnalyzerGroupParams;
