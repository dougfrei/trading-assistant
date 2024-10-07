import { ActionIcon, Button, Grid, NumberInput, SegmentedControl } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { EGqlOptionType } from '@src/interfaces/IGqlResponses';
import { IconCurrencyDollar, IconX } from '@tabler/icons-react';
import { useAddPositionFormContext } from './AddPositionForm.context';

const AddPositionOptionLeg: React.FC<{
	formRowIndex: number;
	isRemovable?: boolean;
}> = ({ formRowIndex, isRemovable = true }) => {
	const form = useAddPositionFormContext();

	return (
		<Grid align="flex-end">
			<Grid.Col
				span={{ base: 6, sm: 'content' }}
				style={{ display: 'grid', alignItems: 'end' }}
			>
				<SegmentedControl
					key={form.key(`optionLegs.${formRowIndex}.optionType`)}
					data={[
						{ value: EGqlOptionType.CALL, label: 'Call' },
						{ value: EGqlOptionType.PUT, label: 'Put' }
					]}
					fullWidth
					{...form.getInputProps(`optionLegs.${formRowIndex}.optionType`)}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 6, sm: 'auto' }}>
				<DatePickerInput
					key={form.key(`optionLegs.${formRowIndex}.expiration`)}
					label="Expiration"
					firstDayOfWeek={0}
					withAsterisk
					dropdownType="modal"
					highlightToday
					excludeDate={(date) => [0, 6].includes(date.getDay())}
					{...form.getInputProps(`optionLegs.${formRowIndex}.expiration`)}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 6, sm: 2 }}>
				<NumberInput
					key={form.key(`optionLegs.${formRowIndex}.strike`)}
					hideControls
					label="Strike"
					leftSection={<IconCurrencyDollar size={14} />}
					decimalScale={2}
					min={0}
					step={1}
					withAsterisk
					{...form.getInputProps(`optionLegs.${formRowIndex}.strike`)}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 6, sm: 2 }}>
				<NumberInput
					key={form.key(`optionLegs.${formRowIndex}.quantity`)}
					hideControls
					label="Quantity"
					step={1}
					withAsterisk
					{...form.getInputProps(`optionLegs.${formRowIndex}.quantity`)}
				/>
			</Grid.Col>

			{isRemovable && (
				<Grid.Col span={{ base: 12, sm: 'content' }}>
					<Button
						hiddenFrom="sm"
						onClick={() => form.removeListItem('optionLegs', formRowIndex)}
						variant="subtle"
						color="red"
						fullWidth
					>
						Remove Leg
					</Button>
					<ActionIcon
						visibleFrom="sm"
						onClick={() => form.removeListItem('optionLegs', formRowIndex)}
						variant="subtle"
						color="red"
						aria-label="Remove option leg"
						mb={4}
					>
						<IconX size={20} />
					</ActionIcon>
				</Grid.Col>
			)}
		</Grid>
	);
};

export default AddPositionOptionLeg;
