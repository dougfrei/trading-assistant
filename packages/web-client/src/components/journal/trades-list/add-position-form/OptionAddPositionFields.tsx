import { Button, Card, Divider, Stack } from '@mantine/core';
import { getDefaultOptionLegValues } from '@src/components/journal/create-trade-form/position-fields/OptionPosition.util';
import { IconPlus } from '@tabler/icons-react';
import { Fragment } from 'react';
import { useAddPositionFormContext } from './AddPositionForm.context';
import AddPositionOptionLeg from './AddPositionOptionLeg';

const OptionAddPositionFields: React.FC = () => {
	const form = useAddPositionFormContext();

	return (
		<Card>
			<Stack gap="xs">
				{form.getValues().optionLegs.map((leg, index) => (
					<Fragment key={`${form.key(`optionLegs.${index}`)}_fragment`}>
						{index > 0 && <Divider />}
						<AddPositionOptionLeg
							key={form.key(`optionLegs.${index}`)}
							formRowIndex={index}
							isRemovable={form.getValues().optionLegs.length > 1}
						/>
					</Fragment>
				))}
				{form.getValues().optionLegs.length > 0 && <Divider />}
				<Button
					onClick={() => form.insertListItem('optionLegs', getDefaultOptionLegValues())}
					leftSection={<IconPlus size={14} />}
					variant="light"
				>
					Add Option Leg
				</Button>
			</Stack>
		</Card>
	);
};

export default OptionAddPositionFields;
