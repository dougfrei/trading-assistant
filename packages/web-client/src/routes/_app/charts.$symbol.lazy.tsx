import Chart from '@src/components/chart/Chart';
import AlertMessage from '@src/components/ui/AlertMessage';
import { useCandles } from '@src/hooks/useCandles';
import { createLazyFileRoute } from '@tanstack/react-router';
import { ECandlePeriodType } from '@trading-assistant/common/enums';

const ChartsView: React.FC = () => {
	const { symbol = 'SPY' } = Route.useParams();
	const {
		candles,
		tickerSymbol,
		tickerSymbolRecord,
		mainChartSeriesGroups,
		chartTypes,
		isLoading,
		errorMessage
	} = useCandles(symbol, ECandlePeriodType.D);

	return (
		<div>
			{!isLoading && (
				<>
					{errorMessage.length > 0 ? (
						<AlertMessage type="error">{errorMessage}</AlertMessage>
					) : (
						<Chart
							candles={candles}
							showVolume
							tickerName={tickerSymbol}
							tickerLabel={tickerSymbolRecord?.label ?? ''}
							mainChartSeriesGroups={mainChartSeriesGroups}
							additionalChartTypes={chartTypes}
						/>
					)}
				</>
			)}
		</div>
	);
};

export const Route = createLazyFileRoute('/_app/charts/$symbol')({
	component: ChartsView
});
