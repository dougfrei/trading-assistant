import { Grid, NumberInput, SegmentedControl } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useAddPositionFormContext } from './AddPositionForm.context';

const StockAddPositionFields: React.FC = () => {
	const form = useAddPositionFormContext();

	return (
		<Grid align="flex-end">
			<Grid.Col span={{ base: 6 }}>
				<SegmentedControl
					key={form.key('stockValues.action')}
					data={[
						{ value: 'buy', label: 'Buy' },
						{ value: 'sell', label: 'Sell' }
					]}
					fullWidth
					color={form.getValues().stockValues.action === 'buy' ? 'green' : 'red'}
					{...form.getInputProps('stockValues.action')}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 6 }}>
				<NumberInput
					key={form.key('stockValues.quantity')}
					hideControls
					label="Quantity"
					step={1}
					withAsterisk
					leftSection={
						form.getValues().stockValues.action === 'buy' ? (
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

export default StockAddPositionFields;
