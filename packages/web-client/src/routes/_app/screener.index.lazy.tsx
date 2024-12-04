import { Button, Drawer, Group, Loader, Pagination, Select, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import OverlayChartModal from '@src/components/overlay-chart/OverlayChartModal';
import ScreenerCard from '@src/components/screener/ScreenerCard';
import AlertMessage from '@src/components/ui/AlertMessage';
import useScreenerQuery from '@src/hooks/useScreenerQuery';
import { IScreenerRouteData } from '@src/route-loaders/screener';
import { IconFilter } from '@tabler/icons-react';
import { createLazyFileRoute, useLoaderData } from '@tanstack/react-router';
import { ECandlePeriodType } from '@trading-assistant/common/enums';
import { useEffect, useMemo, useState } from 'react';

const ScreenerView: React.FC = () => {
	const { screenerQueries, sortMethods, candleAnalyzerAlertTypes, sectors } = useLoaderData({
		from: '/_app/screener/'
	}) as IScreenerRouteData;
	const [chartTickerSymbol, setChartTickerSymbol] = useState('');
	const [page, setPage] = useState(1);
	const [sortMethod, setSortMethod] = useState(sortMethods[0]?.name ?? 'TICKER');
	const [sectorGCIS, setSectorGCIS] = useState('');
	const [queryId, setQueryId] = useState(0);

	const { isLoading, error, records, pagination } = useScreenerQuery({
		periodType: ECandlePeriodType.D,
		page,
		perPage: 25,
		sort: sortMethod,
		sectorGCIS,
		queryId
	});

	const [mobileFiltersOpen, { open: openMobileFilters, close: closeMobileFilters }] =
		useDisclosure(false);

	// scroll to the top of the page whenever the loading status changes
	// so that new results can be seen if the bottom pagination was used
	useEffect(() => {
		if (!isLoading) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}, [isLoading]);

	const queryOptions = useMemo(
		() => [
			{ value: '0', label: 'None' },
			...screenerQueries.map((query) => ({
				value: query.id.toString(),
				label: query.label
			}))
		],
		[screenerQueries]
	);

	const sectorOptions = useMemo(
		() => [
			{ value: '', label: 'All' },
			...sectors.map((sector) => ({ value: sector.gcis, label: sector.name }))
		],
		[sectors]
	);

	const sortByOptions = useMemo(
		() =>
			sortMethods.map((sortMethod) => ({
				value: sortMethod.name,
				label: sortMethod.label
			})),
		[sortMethods]
	);

	if (error) {
		return (
			<AlertMessage title="Screener Error" type="error">
				{error.message}
			</AlertMessage>
		);
	}

	const filterControls = (
		<>
			<Select
				label="Query"
				value={queryId.toString()}
				onChange={(value) => {
					setQueryId(parseInt(value ?? '0'));
					setPage(1);
				}}
				data={queryOptions}
				disabled={isLoading}
				allowDeselect={false}
			/>
			<Select
				label="Sector"
				value={sectorGCIS}
				onChange={(value) => {
					setSectorGCIS(value ?? '');
					setPage(1);
				}}
				data={sectorOptions}
				disabled={isLoading}
				allowDeselect={false}
			/>
			<Select
				label="Sort"
				value={sortMethod}
				onChange={(value) => {
					setSortMethod(value ?? '');
					setPage(1);
				}}
				data={sortByOptions}
				disabled={isLoading}
				allowDeselect={false}
			/>
		</>
	);

	return (
		<>
			<OverlayChartModal
				chartTickerSymbol={chartTickerSymbol}
				onClose={() => setChartTickerSymbol('')}
			/>
			<Drawer
				opened={mobileFiltersOpen}
				onClose={closeMobileFilters}
				title="Screener Filters"
				position="right"
				hiddenFrom="lg"
			>
				<Stack gap="md">{filterControls}</Stack>
			</Drawer>
			<Stack gap="md">
				<Group align="flex-end" justify="space-between">
					<Button
						onClick={openMobileFilters}
						hiddenFrom="lg"
						leftSection={<IconFilter size={14} />}
					>
						Filters
					</Button>
					<Group visibleFrom="lg">{filterControls}</Group>
					<Pagination
						withEdges
						total={pagination.totalPages}
						value={pagination.currentPage}
						onChange={setPage}
						disabled={isLoading}
					/>
				</Group>
				{isLoading ? (
					<Loader />
				) : (
					<>
						{records.length > 0 ? (
							<>
								{records.map((record) => (
									<ScreenerCard
										// record={record}
										currentCandle={record.lastCandle}
										tickerSymbolRecord={record.tickerSymbol}
										alertTypes={candleAnalyzerAlertTypes}
										onViewChart={(tickerSymbol) =>
											setChartTickerSymbol(tickerSymbol)
										}
										key={record.tickerSymbol.name}
									/>
								))}
							</>
						) : (
							<AlertMessage type="warning">No screener results</AlertMessage>
						)}
					</>
				)}
				<Group justify="flex-end" mt="lg" mb="xl">
					<Pagination
						withEdges
						total={pagination.totalPages}
						value={pagination.currentPage}
						onChange={setPage}
						disabled={isLoading}
					/>
				</Group>
			</Stack>
		</>
	);
};

export const Route = createLazyFileRoute('/_app/screener/')({
	component: ScreenerView,
	pendingComponent: () => <Loader />,
	errorComponent: ({ error }) => {
		return (
			<AlertMessage type="error">
				{error.message ?? 'An error occurred while loading the screener'}
			</AlertMessage>
		);
	}
});
