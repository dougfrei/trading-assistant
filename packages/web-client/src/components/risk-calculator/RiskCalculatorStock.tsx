import { Button, NumberInput, SimpleGrid, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	localStorageGetFloatValue,
	localStorageKeys,
	localStorageSetFloatValue
} from '@src/util/localStorage';
import { getNumberInputValue } from '@src/util/mantineHelpers';
import { IconCurrencyDollar, IconPercentage } from '@tabler/icons-react';
import { useState } from 'react';
import { IRiskValuesTableData } from './RiskCalculator.interfaces';
import RiskTiersTable from './RiskTiersTable';

interface IRiskCalculatorStockValues {
	accountSize: number;
	riskPercentage: number;
	entryPrice: number;
	stopPrice: number;
}

const RiskCalculatorStock: React.FC = () => {
	const [tableData, setTableData] = useState<IRiskValuesTableData | null>(null);
	const form = useForm<IRiskCalculatorStockValues>({
		mode: 'uncontrolled',
		initialValues: {
			accountSize: localStorageGetFloatValue(
				localStorageKeys.riskCalculatorStocksAccountSize,
				0
			),
			riskPercentage: 1,
			entryPrice: 0,
			stopPrice: 0
		},
		validate: {
			accountSize: (value) => (value > 0 ? null : 'Must be greater than 0'),
			riskPercentage: (value) => (value > 0 ? null : 'Must be greater than 0'),
			entryPrice: (value) => (value > 0 ? null : 'Must be greater than 0')
		}
	});

	const handleSubmit = (values: IRiskCalculatorStockValues) => {
		localStorageSetFloatValue(
			localStorageKeys.riskCalculatorStocksAccountSize,
			getNumberInputValue(values.accountSize, 0),
			2
		);

		const rrMultipliers = [1, 2, 3];

		const riskPerShare = Math.abs(values.entryPrice - values.stopPrice);

		const totalRiskAmount = Math.floor(values.accountSize * (values.riskPercentage / 100));
		const numShares = Math.floor(totalRiskAmount / riskPerShare);

		setTableData({
			riskPercentage: values.riskPercentage,
			instrumentQuantity: numShares,
			buyingPowerNeeded: numShares * values.entryPrice,
			maxLoss: riskPerShare * numShares,
			riskRewardLevels: rrMultipliers.map((mult) => ({
				multiplier: mult,
				price:
					values.entryPrice +
					(values.entryPrice > values.stopPrice ? riskPerShare : riskPerShare * -1) * mult
			}))
		});
	};

	return (
		<>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap="sm">
					<SimpleGrid cols={2} spacing="md">
						<NumberInput
							label="Account Size"
							hideControls
							min={0}
							required
							leftSection={<IconCurrencyDollar size={14} />}
							key={form.key('accountSize')}
							{...form.getInputProps('accountSize')}
						/>
						<NumberInput
							label="Account Risk Percentage"
							hideControls
							min={0.01}
							max={100}
							step={0.25}
							decimalScale={2}
							required
							rightSection={<IconPercentage size={14} />}
							key={form.key('riskPercentage')}
							{...form.getInputProps('riskPercentage')}
						/>
						<NumberInput
							label="Entry Price"
							hideControls
							min={0.01}
							decimalScale={2}
							required
							leftSection={<IconCurrencyDollar size={14} />}
							key={form.key('entryPrice')}
							{...form.getInputProps('entryPrice')}
						/>
						<NumberInput
							label="Stop Price"
							hideControls
							min={0.01}
							decimalScale={2}
							required
							leftSection={<IconCurrencyDollar size={14} />}
							key={form.key('stopPrice')}
							{...form.getInputProps('stopPrice')}
						/>
					</SimpleGrid>

					<Button type="submit" fullWidth mt="lg">
						Calculate
					</Button>
				</Stack>
			</form>
			{tableData !== null && (
				<RiskTiersTable tableData={tableData} quantityColumnLabel="# Shares" />
			)}
		</>
	);
};

export default RiskCalculatorStock;
