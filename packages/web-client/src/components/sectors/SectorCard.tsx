import { LineChart } from '@mantine/charts';
import { Badge, Card, Group, Title } from '@mantine/core';
import { IGqlSector } from '@src/interfaces/IGqlResponses';
import { useMemo } from 'react';
import styles from './SectorCard.module.css';

const SectorCard: React.FC<{
	sector: IGqlSector;
	isSelected?: boolean;
	onClick: (sector: IGqlSector) => void;
}> = ({ sector, isSelected = false, onClick }) => {
	const rrsMarketValues = useMemo(
		() =>
			sector.etfTickerSymbol.candles
				?.map((candle) => ({
					period: candle.period,
					vwrrsMarket: candle.indicators['vwrrs_market'] ?? 0
				}))
				.reverse() ?? [],
		[sector.etfTickerSymbol.candles]
	);

	const cardClasses = [styles.card];

	if (isSelected) {
		cardClasses.push(styles.cardSelected);
	}

	return (
		<Card
			key={sector.gcis}
			className={cardClasses.join(' ')}
			shadow="sm"
			padding="md"
			radius="md"
			withBorder
			component="button"
			onClick={() => onClick(sector)}
			bg="dark.9"
		>
			<Group align="center" justify="space-between" wrap="nowrap">
				<Title className={styles.title} order={5}>
					{sector.name}
				</Title>
				<Badge>{sector.etfTickerSymbol.name}</Badge>
			</Group>
			<LineChart
				h={150}
				data={rrsMarketValues}
				dataKey="period"
				series={[{ name: 'vwrrsMarket', color: 'cyan' }]}
				curveType="linear"
				withXAxis={false}
				withYAxis={false}
				strokeWidth={2}
				type="gradient"
				gradientStops={[
					{ offset: 0, color: 'green' },
					{ offset: 50, color: 'rgba(255,255,255,0.6)' },
					{ offset: 100, color: 'red' }
				]}
				referenceLines={[{ y: 0, color: 'rgba(255,255,255,0.25)' }]}
				gridAxis="none"
				withDots={false}
				withTooltip={false}
			></LineChart>
		</Card>
	);
};

export default SectorCard;
