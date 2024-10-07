import { Table } from '@mantine/core';
import { getCurrencyFormatter } from '@src/util/currency';
import { IRiskValuesTableData } from './RiskCalculator.interfaces';

const RiskTiersTable: React.FC<{
	tableData: IRiskValuesTableData;
	quantityColumnLabel?: string;
}> = ({ tableData, quantityColumnLabel = 'Quantity' }) => {
	const usdFormatter = getCurrencyFormatter({ currencyDisplay: 'narrowSymbol' });

	return (
		<>
			<Table mt="lg" striped withTableBorder withColumnBorders>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Risk</Table.Th>
						<Table.Th>{quantityColumnLabel}</Table.Th>
						<Table.Th>Buying Power Needed</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					<Table.Tr>
						<Table.Td>{tableData.riskPercentage}%</Table.Td>
						<Table.Td>{tableData.instrumentQuantity}</Table.Td>
						<Table.Td>{usdFormatter.format(tableData.buyingPowerNeeded)}</Table.Td>
					</Table.Tr>
				</Table.Tbody>
			</Table>
			<p>Expected max loss: {usdFormatter.format(tableData.maxLoss)}</p>
			{tableData.riskRewardLevels.length > 0 && (
				<Table mt="lg" striped withTableBorder withColumnBorders>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>R:R Multiplier</Table.Th>
							<Table.Th>Target Price</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{tableData.riskRewardLevels.map((level) => (
							<Table.Tr key={level.multiplier}>
								<Table.Td>{level.multiplier}:1</Table.Td>
								<Table.Td>{usdFormatter.format(level.price)}</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			)}
		</>
	);
};

export default RiskTiersTable;
