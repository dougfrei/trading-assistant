import { ActionIcon, Grid, TextInput } from '@mantine/core';
import PriceNumberInput from '@src/components/controls/PriceNumberInput';
import { IconX } from '@tabler/icons-react';
import { useCreateTradeFormContext } from './CreateTradeForm.context';

const PriceTargetRow: React.FC<{
	keyPath: string;
	rowIndex: number;
	removeAriaLabel?: string;
}> = ({ keyPath, rowIndex, removeAriaLabel = 'Remove price target' }) => {
	const form = useCreateTradeFormContext();

	return (
		<Grid align="center">
			<Grid.Col span={4}>
				<PriceNumberInput
					key={form.key(`${keyPath}.${rowIndex}.value`)}
					{...form.getInputProps(`${keyPath}.${rowIndex}.value`)}
				/>
			</Grid.Col>
			<Grid.Col span="auto">
				<TextInput
					key={form.key(`${keyPath}.${rowIndex}.notes`)}
					placeholder="Notes"
					maxLength={255}
					{...form.getInputProps(`${keyPath}.${rowIndex}.notes`)}
				/>
			</Grid.Col>
			<Grid.Col span="content">
				<ActionIcon
					onClick={() => form.removeListItem(keyPath, rowIndex)}
					variant="subtle"
					color="red"
					aria-label={removeAriaLabel}
				>
					<IconX size={20} />
				</ActionIcon>
			</Grid.Col>
		</Grid>
	);
};

export default PriceTargetRow;
