import { Card, SimpleGrid, Text, Title } from '@mantine/core';
import { IGqlTradePerformance } from '@src/interfaces/IGqlResponses';
import { getCurrencyFormatter } from '@src/util/currency';

const TradeMetricsCalendarStats: React.FC<{
	performance: IGqlTradePerformance;
}> = ({ performance }) => {
	const usdFormatter = getCurrencyFormatter();

	return (
		<SimpleGrid cols={5}>
			<Card withBorder shadow="sm" radius="md" style={{ textAlign: 'center' }}>
				<Title order={5}>Total PnL</Title>
				<Text>{usdFormatter.format(performance.totalPnl)}</Text>
			</Card>
			<Card withBorder shadow="sm" radius="md" style={{ textAlign: 'center' }}>
				<Title order={5}>Win Rate</Title>
				<Text>{performance.totalWinRate}%</Text>
			</Card>
			<Card withBorder shadow="sm" radius="md" style={{ textAlign: 'center' }}>
				<Title order={5}>Profit Factor</Title>
				<Text>{performance.totalProfitFactor}</Text>
			</Card>
			<Card withBorder shadow="sm" radius="md" style={{ textAlign: 'center' }}>
				<Title order={5}>Average Winner</Title>
			</Card>
			<Card withBorder shadow="sm" radius="md" style={{ textAlign: 'center' }}>
				<Title order={5}>Average Loser</Title>
			</Card>
		</SimpleGrid>
	);
};

export default TradeMetricsCalendarStats;
