import { Loader } from '@mantine/core';
import { useCandles } from '@src/hooks/useCandles';
import { IGqlSector } from '@src/interfaces/IGqlResponses';
import { ECandlePeriodType } from '@trading-assistant/common/enums';
import { Suspense, lazy } from 'react';
import AlertMessage from '../ui/AlertMessage';

const Chart = lazy(() => import('../chart/Chart'));

const SectorChart: React.FC<{
	sector: IGqlSector;
}> = ({ sector }) => {
	const {
		candles,
		tickerSymbol,
		tickerSymbolRecord,
		mainChartSeriesGroups,
		chartTypes,
		isLoading,
		errorMessage
	} = useCandles(sector.etfTickerSymbol.name, ECandlePeriodType.D);

	return (
		<div>
			{!isLoading && (
				<>
					{errorMessage.length > 0 ? (
						<AlertMessage type="error">{errorMessage}</AlertMessage>
					) : (
						<Suspense fallback={<Loader />}>
							<Chart
								candles={candles}
								showVolume
								tickerName={tickerSymbol}
								tickerLabel={tickerSymbolRecord?.label ?? ''}
								mainChartSeriesGroups={mainChartSeriesGroups}
								additionalChartTypes={chartTypes}
							/>
						</Suspense>
					)}
				</>
			)}
		</div>
	);
};

export default SectorChart;
