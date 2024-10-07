import { Badge, Card, DefaultMantineColor, Group, Text } from '@mantine/core';
import { IGqlTickerSymbolNews } from '@src/interfaces/IGqlResponses';
import { Link } from '@tanstack/react-router';
import styles from './TickerSymbolNewsItem.module.css';

const TickerSymbolNewsItem: React.FC<{
	record: IGqlTickerSymbolNews;
}> = ({ record }) => {
	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	return (
		<Card withBorder>
			<Text fz="xs">{dateFormatter.format(new Date(record.publishedUTC))}</Text>
			<Text
				component="a"
				href={record.articleURL}
				target="_blank"
				rel="nofollow noreferer noopener"
				fz="h6"
				fw="bold"
			>
				{record.title}
			</Text>
			{record.insights.length > 0 && (
				<Group gap="xs" mt="sm">
					{record.insights.map((insight) => {
						let color: DefaultMantineColor = 'gray';

						if (insight.sentiment !== 'neutral') {
							color = insight.sentiment === 'positive' ? 'green' : 'red';
						}

						return (
							<Link
								key={insight.ticker}
								to="/charts/$symbol"
								params={{ symbol: insight.ticker }}
								className={styles.link}
							>
								<Badge size="sm" color={color}>
									{insight.ticker}
								</Badge>
							</Link>
						);
					})}
				</Group>
			)}
		</Card>
	);
};

export default TickerSymbolNewsItem;
