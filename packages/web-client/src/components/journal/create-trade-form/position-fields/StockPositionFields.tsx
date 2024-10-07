import { Grid, NumberInput, SegmentedControl, TextInput } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useCreateTradeFormContext } from '../CreateTradeForm.context';

const StockPositionFields: React.FC = () => {
	const form = useCreateTradeFormContext();

	return (
		<Grid align="flex-end">
			<Grid.Col span={{ base: 12, md: 4 }}>
				<TextInput
					key={form.key('tickerSymbol')}
					label="Ticker Symbol"
					withAsterisk
					{...form.getInputProps('tickerSymbol')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 6, md: 2 }}>
				<SegmentedControl
					key={form.key('stockValues.side')}
					data={[
						{ value: 'long', label: 'Long' },
						{ value: 'short', label: 'Short' }
					]}
					fullWidth
					color={form.getValues().stockValues.side === 'long' ? 'green' : 'red'}
					{...form.getInputProps('stockValues.side')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 6, md: 6 }}>
				<NumberInput
					key={form.key('stockValues.quantity')}
					hideControls
					label="Quantity"
					step={1}
					withAsterisk
					leftSection={
						form.getValues().stockValues.side === 'long' ? (
							<IconPlus size={14} width={26} />
						) : (
							<IconMinus size={14} width={26} />
						)
					}
					{...form.getInputProps('stockValues.quantity')}
				/>
			</Grid.Col>
		</Grid>
	);
};

export default StockPositionFields;
