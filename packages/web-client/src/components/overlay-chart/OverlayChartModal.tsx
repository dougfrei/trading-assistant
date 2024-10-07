import { Loader, Modal } from '@mantine/core';
import { useCandles } from '@src/hooks/useCandles';
import { ECandlePeriodType } from '@trading-assistant/common/enums';
import { Suspense, lazy } from 'react';
import AlertMessage from '../ui/AlertMessage';

const Chart = lazy(() => import('../chart/Chart'));

const OverlayChartModal: React.FC<{
	chartTickerSymbol: string;
	onClose: () => void;
}> = ({ chartTickerSymbol, onClose }) => {
	const {
		candles,
		tickerSymbolRecord,
		mainChartSeriesGroups,
		chartTypes,
		isLoading,
		errorMessage
	} = useCandles(chartTickerSymbol, ECandlePeriodType.D);

	return (
		<Modal opened={chartTickerSymbol !== ''} onClose={onClose} fullScreen>
			{isLoading ? (
				<Loader />
			) : (
				<>
					{errorMessage.length ? (
						<AlertMessage type="error">{errorMessage}</AlertMessage>
					) : (
						<Suspense fallback={<Loader />}>
							<Chart
								candles={candles}
								showVolume
								tickerName={chartTickerSymbol}
								tickerLabel={tickerSymbolRecord?.label ?? ''}
								mainChartSeriesGroups={mainChartSeriesGroups}
								additionalChartTypes={chartTypes}
							/>
						</Suspense>
					)}
				</>
			)}
		</Modal>
	);
};

export default OverlayChartModal;
