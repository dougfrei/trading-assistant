import { Grid, Loader, ScrollArea, Select, Stack, Tabs, Title } from '@mantine/core';
import SectorCard from '@src/components/sectors/SectorCard';
import SectorChart from '@src/components/sectors/SectorChart';
import SectorHoldings from '@src/components/sectors/SectorHoldings';
import AlertMessage from '@src/components/ui/AlertMessage';
import { IGqlSector } from '@src/interfaces/IGqlResponses';
import { IconChartLine, IconListDetails } from '@tabler/icons-react';
import { createLazyFileRoute, useLoaderData } from '@tanstack/react-router';
import { useRef, useState } from 'react';

const SectorsView: React.FC = () => {
	const sectors = useLoaderData({
		from: '/_app/sectors/'
	}) as IGqlSector[];
	const [selectedSector, setSelectedSector] = useState<IGqlSector | null>(sectors[0] ?? null);
	const [activeTab, setActiveTab] = useState<string | null>('chart');
	const contentViewport = useRef<HTMLDivElement>(null);

	const mobileSelectData = sectors.map((sector) => ({
		value: sector.gcis,
		label: sector.name
	}));

	return (
		<Grid>
			<Grid.Col span={{ base: 12, md: 3 }}>
				<ScrollArea.Autosize
					type="never"
					mah={{
						base: '',
						md: 'calc(100dvh - calc(var(--app-shell-header-offset, 0rem) + var(--app-shell-padding)))'
					}}
				>
					<Select
						data={mobileSelectData}
						value={selectedSector?.gcis ?? ''}
						onChange={(gcis) => {
							setActiveTab('chart');
							setSelectedSector(
								sectors.find((sector) => sector.gcis === gcis) ?? null
							);
						}}
						allowDeselect={false}
						hiddenFrom="md"
					/>
					<Stack gap="md" visibleFrom="md">
						{sectors.map((sector) => (
							<SectorCard
								key={sector.gcis}
								sector={sector}
								onClick={(value) => {
									setActiveTab('chart');
									setSelectedSector(value);
								}}
								isSelected={sector.gcis === selectedSector?.gcis}
							/>
						))}
					</Stack>
				</ScrollArea.Autosize>
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 9 }}>
				<ScrollArea.Autosize
					offsetScrollbars
					scrollHideDelay={0}
					viewportRef={contentViewport}
					mah={{
						base: '',
						md: 'calc(100dvh - calc(var(--app-shell-header-offset, 0rem) + var(--app-shell-padding)))'
					}}
				>
					<Title order={1} visibleFrom="md">
						{selectedSector?.name}
					</Title>
					<Tabs value={activeTab} onChange={setActiveTab} keepMounted={false} mt="md">
						<Tabs.List>
							<Tabs.Tab value="chart" leftSection={<IconChartLine size={18} />}>
								ETF Chart
							</Tabs.Tab>
							<Tabs.Tab value="stocks" leftSection={<IconListDetails size={18} />}>
								Included Stocks
							</Tabs.Tab>
						</Tabs.List>
						<Tabs.Panel value="chart">
							{selectedSector !== null ? (
								<SectorChart sector={selectedSector} />
							) : (
								<p>Please select a sector</p>
							)}
						</Tabs.Panel>
						<Tabs.Panel value="stocks" mt="sm">
							{selectedSector !== null ? (
								<SectorHoldings
									gcis={selectedSector.gcis}
									onScrollToTop={() =>
										contentViewport?.current?.scrollTo({
											top: 0,
											behavior: 'smooth'
										})
									}
								/>
							) : (
								<p>Please select a sector</p>
							)}
						</Tabs.Panel>
					</Tabs>
				</ScrollArea.Autosize>
			</Grid.Col>
		</Grid>
	);
};

export const Route = createLazyFileRoute('/_app/sectors/')({
	component: SectorsView,
	pendingComponent: () => <Loader />,
	errorComponent: ({ error }) => {
		return (
			<AlertMessage type="error">
				{error.message ?? 'An error occurred while loading sectors content'}
			</AlertMessage>
		);
	}
});
