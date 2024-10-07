import { ActionIcon, Button, Grid, NumberInput, SegmentedControl } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import EOptionGroupTypeLegEditable from '@src/enums/EOptionGroupTypeLegEditable';
import {
	EGqlOptionType,
	IGqlTradeOptionSpreadTemplate,
	IGqlTradeOptionSpreadTemplateLeg
} from '@src/interfaces/IGqlResponses';
import { getNumberInputValue } from '@src/util/mantineHelpers';
import { IconCurrencyDollar, IconX } from '@tabler/icons-react';
import { useCreateTradeFormContext } from '../CreateTradeForm.context';
import { updateLegExpiration, updateLegStrike } from './OptionPosition.util';

const OptionPositionLeg: React.FC<{
	formRowIndex: number;
	legTemplate?: IGqlTradeOptionSpreadTemplateLeg;
	disableExpiration?: boolean;
	disableStrike?: boolean;
	removable?: boolean;
	quantityMultiplier?: number | null;
	associatedSpreadTemplate?: IGqlTradeOptionSpreadTemplate;
}> = ({
	formRowIndex,
	legTemplate,
	disableExpiration = false,
	disableStrike = false,
	removable = true,
	quantityMultiplier = null,
	associatedSpreadTemplate
}) => {
	const form = useCreateTradeFormContext();
	const expirationInputProps = form.getInputProps(`optionLegs.${formRowIndex}.expiration`);
	const strikeInputProps = form.getInputProps(`optionLegs.${formRowIndex}.strike`);

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
					disabled={
						legTemplate &&
						!legTemplate.editableFields.includes(EOptionGroupTypeLegEditable.TYPE)
					}
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
					disabled={disableExpiration}
					highlightToday
					excludeDate={(date) => [0, 6].includes(date.getDay())}
					{...expirationInputProps}
					onChange={(value) => {
						expirationInputProps.onChange(value);

						if (value) {
							form.setFieldValue(
								'optionLegs',
								updateLegExpiration(
									formRowIndex,
									value,
									form.getValues().optionLegs,
									associatedSpreadTemplate?.legs ?? []
								)
							);
						}
					}}
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
					disabled={disableStrike}
					{...strikeInputProps}
					onChange={(value) => {
						strikeInputProps.onChange(value);

						form.setFieldValue(
							'optionLegs',
							updateLegStrike(
								formRowIndex,
								getNumberInputValue(value, 1),
								form.getValues().optionLegs,
								associatedSpreadTemplate?.legs ?? []
							)
						);
					}}
				/>
			</Grid.Col>
			<Grid.Col span={{ base: 6, sm: 2 }}>
				<NumberInput
					key={form.key(`optionLegs.${formRowIndex}.quantity`)}
					hideControls
					label="Quantity"
					step={1}
					withAsterisk
					disabled={quantityMultiplier !== null}
					{...form.getInputProps(`optionLegs.${formRowIndex}.quantity`)}
				/>
			</Grid.Col>
			{removable && (
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

export default OptionPositionLeg;
