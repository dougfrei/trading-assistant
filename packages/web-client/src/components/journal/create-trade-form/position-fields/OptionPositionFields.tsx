import { Button, Card, Divider, Grid, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { IGqlTradeOptionSpreadTemplateGroup } from '@src/interfaces/IGqlResponses';
import { getNumberInputValue } from '@src/util/mantineHelpers';
import { IconPlus } from '@tabler/icons-react';
import { Fragment, useMemo, useState } from 'react';
import { useCreateTradeFormContext } from '../CreateTradeForm.context';
import {
	createOptionSpreadTemplateComboboxGroups,
	getDefaultOptionLegValues
} from './OptionPosition.util';
import OptionPositionLeg from './OptionPositionLeg';

const OptionPositionFields: React.FC<{
	spreadTemplateGroups: IGqlTradeOptionSpreadTemplateGroup[];
	spreadTemplate: string;
}> = ({ spreadTemplateGroups, spreadTemplate }) => {
	const form = useCreateTradeFormContext();
	const [legQuantityMultiplier, setLegQuantityMultiplier] = useState(1);
	const optionSpreadTemplates = useMemo(
		() => spreadTemplateGroups.flatMap((group) => group.templates),
		[spreadTemplateGroups]
	);

	const strategySelectItems = useMemo(
		() => [
			{
				group: 'Custom',
				items: [
					{
						value: '',
						label: 'Custom Option Strategy'
					}
				]
			},
			...createOptionSpreadTemplateComboboxGroups(spreadTemplateGroups)
		],
		[spreadTemplateGroups]
	);

	const activeSpreadTemplate = useMemo(
		() => optionSpreadTemplates.find((tmpl) => tmpl.name === spreadTemplate),
		[spreadTemplate, optionSpreadTemplates]
	);

	const usedStrikeGroups = new Set<number>();
	const usedExpGroups = new Set<number>();

	const isRemovable = !activeSpreadTemplate && form.getValues().optionLegs.length > 1;

	return (
		<Stack>
			<Grid align="flex-end">
				<Grid.Col span={{ base: 12, sm: 'content' }}>
					<TextInput
						key={form.key('tickerSymbol')}
						label="Ticker Symbol"
						withAsterisk
						{...form.getInputProps('tickerSymbol')}
					/>
				</Grid.Col>
				<Grid.Col span="auto">
					<Select
						key={form.key('optionSpreadTemplate')}
						allowDeselect={false}
						label="Option Strategy"
						withAsterisk
						data={strategySelectItems}
						comboboxProps={{ withinPortal: true }}
						{...form.getInputProps('optionSpreadTemplate')}
					/>
				</Grid.Col>
				<Grid.Col span="content">
					{spreadTemplate === '' ? (
						<Button
							onClick={() =>
								form.insertListItem('optionLegs', getDefaultOptionLegValues())
							}
							leftSection={<IconPlus size={14} />}
							variant="light"
						>
							Add Option Leg
						</Button>
					) : (
						<NumberInput
							label="Quantity"
							value={legQuantityMultiplier}
							onChange={(value) => {
								if (!activeSpreadTemplate) {
									return;
								}

								const multiplier = getNumberInputValue(value, 1);

								const newLegs = form.getValues().optionLegs.map((leg, index) => {
									return {
										...leg,
										quantity:
											activeSpreadTemplate.legs[index].quantity *
											activeSpreadTemplate.legs[index].quantityMultiplier *
											multiplier
									};
								});

								form.setFieldValue('optionLegs', newLegs);

								setLegQuantityMultiplier(multiplier);
							}}
							min={1}
							step={1}
						/>
					)}
				</Grid.Col>
			</Grid>
			<Card>
				<Stack gap="xs">
					{form.getValues().optionLegs.map((leg, index) => {
						const legTemplate = activeSpreadTemplate?.legs[index];

						const expDisabled =
							legTemplate && usedExpGroups.has(legTemplate.expirationGroup);
						const strikeDisabled =
							legTemplate && usedStrikeGroups.has(legTemplate.strikeGroup);

						if (legTemplate) {
							usedExpGroups.add(legTemplate.expirationGroup);
							usedStrikeGroups.add(legTemplate.strikeGroup);
						}

						return (
							<Fragment key={`${form.key(`optionLegs.${index}`)}_fragment`}>
								{index > 0 && <Divider />}
								<OptionPositionLeg
									key={form.key(`optionLegs.${index}`)}
									formRowIndex={index}
									legTemplate={legTemplate}
									disableExpiration={expDisabled}
									disableStrike={strikeDisabled}
									removable={isRemovable}
									quantityMultiplier={
										spreadTemplate !== '' ? legQuantityMultiplier : null
									}
									associatedSpreadTemplate={activeSpreadTemplate}
								/>
							</Fragment>
						);
					})}
				</Stack>
			</Card>
		</Stack>
	);
};

export default OptionPositionFields;
