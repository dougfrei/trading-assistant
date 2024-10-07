import { Button, Stack } from '@mantine/core';
import { IGqlTickerSymbolNews } from '@src/interfaces/IGqlResponses';
import { useState } from 'react';
import TickerSymbolNewsItem from './TickerSymbolNewsItem';

const TickerSymbolNews: React.FC<{
	records: IGqlTickerSymbolNews[];
	numPerGroup?: number;
}> = ({ records, numPerGroup = 5 }) => {
	const [numGroupsVisible, setNumGroupsVisible] = useState(1);

	const visibleRecords = records.slice(0, numGroupsVisible * numPerGroup);

	return (
		<Stack>
			{visibleRecords.map((record) => (
				<TickerSymbolNewsItem key={record.id} record={record} />
			))}
			{visibleRecords.length < records.length && (
				<Button
					variant="subtle"
					onClick={() => setNumGroupsVisible((curNumGroups) => curNumGroups + 1)}
				>
					View More
				</Button>
			)}
		</Stack>
	);
};

export default TickerSymbolNews;
