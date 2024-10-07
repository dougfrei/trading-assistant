import { Group, Loader, Pagination, Select, Stack } from '@mantine/core';
import useGetSectorHoldings from '@src/hooks/useGetSectorHoldings';
import { useState } from 'react';
import OverlayChartModal from '../overlay-chart/OverlayChartModal';
import ScreenerCard from '../screener/ScreenerCard';
import AlertMessage from '../ui/AlertMessage';

const SectorHoldings: React.FC<{
	gcis: string;
	onScrollToTop: () => void;
}> = ({ gcis, onScrollToTop }) => {
	const [selectedTickerSymbol, setSelectedTickerSymbol] = useState('');
	const [sortMethod, setSortMethod] = useState('NAME_ASC');
	const [currentPage, setCurrentPage] = useState(1);
	const { pagination, records, candleAnalyzerAlertTypes, loading, error } = useGetSectorHoldings({
		gcis,
		page: currentPage,
		sort: sortMethod
	});

	if (loading) {
		return <Loader />;
	}

	if (error) {
		return <AlertMessage type="error">Error: {error.message}</AlertMessage>;
	}

	return (
		<>
			<OverlayChartModal
				chartTickerSymbol={selectedTickerSymbol}
				onClose={() => setSelectedTickerSymbol('')}
			/>
			<Stack>
				<Group justify="space-between" align="flex-end">
					<Select
						label="Sort"
						value={sortMethod}
						onChange={(value) => {
							setSortMethod(value ?? 'NAME_ASC');
							setCurrentPage(1);
						}}
						data={[
							{ value: 'NAME_ASC', label: 'Name (ascending)' },
							{ value: 'NAME_DESC', label: 'Name (descending)' },
							{ value: 'MARKET_CAP_ASC', label: 'Market Cap (ascending)' },
							{ value: 'MARKET_CAP_DESC', label: 'Market Cap (descending)' },
							{
								value: 'AVG_DAILY_VOL_ASC',
								label: 'Average Daily Volume (ascending)'
							},
							{
								value: 'AVG_DAILY_VOL_DESC',
								label: 'Average Daily Volume (descending)'
							}
						]}
						allowDeselect={false}
					/>
					<Pagination
						withEdges
						total={pagination?.totalPages ?? 1}
						value={pagination?.currentPage ?? 1}
						onChange={setCurrentPage}
						disabled={loading}
					/>
				</Group>
				{records.map((tickerSymbol) => (
					<ScreenerCard
						key={tickerSymbol.id}
						currentCandle={
							Array.isArray(tickerSymbol.candles)
								? tickerSymbol.candles[0]
								: undefined
						}
						tickerSymbolRecord={tickerSymbol}
						alertTypes={candleAnalyzerAlertTypes}
						onViewChart={setSelectedTickerSymbol}
					/>
				))}
				<Group justify="flex-end">
					<Pagination
						withEdges
						total={pagination?.totalPages ?? 1}
						value={pagination?.currentPage ?? 1}
						onChange={(newPage) => {
							onScrollToTop();
							setCurrentPage(newPage);
						}}
						disabled={loading}
					/>
				</Group>
			</Stack>
		</>
	);
};

export default SectorHoldings;
