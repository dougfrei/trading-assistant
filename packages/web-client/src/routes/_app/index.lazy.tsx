import { Card, Loader, SimpleGrid, Title } from '@mantine/core';
import TickerSymbolNews from '@src/components/news/TickerSymbolNews';
import AlertMessage from '@src/components/ui/AlertMessage';
import { IGqlTickerSymbolNews } from '@src/interfaces/IGqlResponses';
import { createLazyFileRoute, useLoaderData } from '@tanstack/react-router';
import { EconomicCalendar } from 'react-ts-tradingview-widgets';

const DashboardView: React.FC = () => {
	const marketNewsItems = useLoaderData({
		from: '/_app/'
	}) as IGqlTickerSymbolNews[];

	return (
		<SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'md', md: 'lg' }}>
			<div>
				<Title order={3} mb="sm">
					Economic Calendar
				</Title>
				<Card shadow="sm" withBorder>
					<EconomicCalendar
						colorTheme="dark"
						// autosize={true}
						// height="100%"
						width="100%"
						height={600}
						// currencyFilter="USD"
						importanceFilter="0,1"
						copyrightStyles={{ parent: { display: 'none' } }}
					/>
				</Card>
			</div>
			<div>
				<Title order={3} mb="sm">
					Market News
				</Title>
				<TickerSymbolNews records={marketNewsItems} />
			</div>
		</SimpleGrid>
	);
};

export const Route = createLazyFileRoute('/_app/')({
	component: DashboardView,
	pendingComponent: () => <Loader />,
	errorComponent: ({ error }) => {
		return (
			<AlertMessage type="error">
				{error.message ?? 'An error occurred while loading the dashboard content'}
			</AlertMessage>
		);
	}
});
