import {
	Badge,
	Card,
	DefaultMantineColor,
	Grid,
	Group,
	Notification,
	SimpleGrid,
	Title,
	UnstyledButton
} from '@mantine/core';
import {
	EGqlCandleAnalyzerAlertTypeSentiment,
	IGqlCandle,
	IGqlCandleAnalyzerAlertType,
	IGqlTickerSymbol
} from '@src/interfaces/IGqlResponses';
import { getCurrencyFormatter } from '@src/util/currency';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

const ScreenerCard: React.FC<{
	currentCandle?: IGqlCandle;
	tickerSymbolRecord?: IGqlTickerSymbol;
	alertTypes: IGqlCandleAnalyzerAlertType[];
	onViewChart: (tickerSymbol: string) => void;
}> = ({ currentCandle, tickerSymbolRecord, alertTypes, onViewChart }) => {
	const smaValues = [50, 100, 200];
	const rsrwMarketExists = typeof currentCandle?.indicators['vwrrs_market'] === 'number';
	const rsrwMarket = currentCandle?.indicators['vwrrs_market'] ?? 0;
	const rsrwMarketTrend = currentCandle?.indicators['vwrrs_market_trend'] ?? 0;
	const rsrwMarketDDExists = typeof currentCandle?.indicators['vwrrs_market_dd'] === 'number';
	const rsrwMarketDD = currentCandle?.indicators['vwrrs_market_dd'] ?? 0;
	const expectedMove =
		typeof currentCandle?.indicators['atr'] !== 'undefined'
			? (currentCandle.indicators['atr'] / currentCandle.close) * 100
			: 0;
	const avgDailyVol = tickerSymbolRecord?.averageDailyVolume ?? 0;
	const avgDailyVolFormatted = avgDailyVol ? `${(avgDailyVol / 1000000).toFixed(2)} M` : 'N/A';
	const rVol = currentCandle?.indicators['rvol'] ?? 0;
	const usdFormatter = getCurrencyFormatter();

	return (
		<UnstyledButton
			style={{ width: '100%' }}
			onClick={() => onViewChart(tickerSymbolRecord?.name ?? '')}
		>
			<Card shadow="sm" p="lg" radius="md" withBorder key={tickerSymbolRecord?.name}>
				<Grid>
					<Grid.Col span={{ base: 12, md: 'auto' }}>
						<Group gap="xs">
							<Badge color="gray" size="xl" radius="xs" variant="outline">
								{tickerSymbolRecord?.name}
							</Badge>
							<Title order={5}>{tickerSymbolRecord?.label}</Title>
						</Group>
						{(tickerSymbolRecord?.sector?.name ?? '').length > 0 && (
							<Title order={6} mt="xs">
								{tickerSymbolRecord?.sector?.name ?? ''}
							</Title>
						)}
						<p>{usdFormatter.format(currentCandle?.close ?? 0)}</p>
						{smaValues.length > 0 && (
							<Group mt="md" gap="xs">
								{smaValues.map((smaValue) => {
									const value =
										currentCandle?.indicators[`sma_${smaValue}`] ?? null;

									if (value === null) {
										return null;
									}

									return (
										<Badge
											key={smaValue}
											variant="dot"
											radius="xs"
											size="lg"
											color={
												(currentCandle?.close ?? 0) >= value
													? 'green'
													: 'red'
											}
										>
											SMA {smaValue}
										</Badge>
									);
								})}
							</Group>
						)}
						<Group mt="md" gap="xs">
							{(currentCandle?.alerts ?? []).map((alert) => {
								const alertType = alertTypes.find((type) => type.key === alert);
								let color: DefaultMantineColor = 'gray';

								switch (alertType?.sentiment ?? '') {
									case EGqlCandleAnalyzerAlertTypeSentiment.BULLISH:
										color = 'green';
										break;

									case EGqlCandleAnalyzerAlertTypeSentiment.BEARISH:
										color = 'red';
										break;

									default:
										break;
								}

								return (
									<Badge variant="light" color={color} radius="xs" key={alert}>
										{alertType ? alertType.label : alert}
									</Badge>
								);
							})}
						</Group>
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 'content' }}>
						<SimpleGrid cols={2}>
							<Notification
								title="Market RS/RW"
								withCloseButton={false}
								withBorder
								color={
									rsrwMarketExists ? (rsrwMarket > 0 ? 'green' : 'red') : 'gray'
								}
							>
								<Group align="center" justify="flex-start" gap="xs">
									{rsrwMarketExists ? (
										<>
											<strong>{rsrwMarket}</strong>
											{rsrwMarketTrend >= 0 ? (
												<IconTrendingUp size={16} color="green" />
											) : (
												<IconTrendingDown size={16} color="red" />
											)}
										</>
									) : (
										<span>N/A</span>
									)}
								</Group>
							</Notification>
							<Notification
								title="Market RS/RW DD"
								withCloseButton={false}
								withBorder
								color={
									rsrwMarketDDExists
										? rsrwMarketDD > 0
											? 'green'
											: 'red'
										: 'gray'
								}
							>
								{rsrwMarketDDExists ? rsrwMarketDD : 'N/A'}
							</Notification>
							<Notification
								title="Expected Move"
								withCloseButton={false}
								withBorder
								color="gray"
							>
								+/- {parseFloat((expectedMove / 2).toFixed(2))}%
							</Notification>
							<Notification
								title="Avg. Daily Vol."
								withCloseButton={false}
								withBorder
								color="gray"
							>
								{avgDailyVolFormatted}
							</Notification>
							<Notification
								title="Relative Vol."
								withCloseButton={false}
								withBorder
								color="gray"
							>
								{rVol}
							</Notification>
						</SimpleGrid>
					</Grid.Col>
				</Grid>
			</Card>
		</UnstyledButton>
	);
};

export default ScreenerCard;
