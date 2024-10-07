import { Fieldset, Grid, SegmentedControl, Stack } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import PriceNumberInput from '@src/components/controls/PriceNumberInput';
import { IGqlTradeOptionSpreadTemplateGroup } from '@src/interfaces/IGqlResponses';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';
import { useCreateTradeFormContext } from '../CreateTradeForm.context';
import { getInitialOptionSpreadLegs } from '../position-fields/OptionPosition.util';
import OptionPositionFields from '../position-fields/OptionPositionFields';
import StockPositionFields from '../position-fields/StockPositionFields';

const InitialPosition: React.FC<{
	tradeOptionSpreadTemplateGroups: IGqlTradeOptionSpreadTemplateGroup[];
}> = ({ tradeOptionSpreadTemplateGroups }) => {
	const form = useCreateTradeFormContext();

	form.watch('instrumentName', ({ value }) => {
		form.setFieldValue('initialPosition.price', 0);

		if (value === ETradeInstrumentType.STOCK) {
			form.setFieldValue(
				'initialPosition.netEffect',
				form.getValues().stockValues.side === 'long' ? 'debit' : 'credit'
			);
		}
	});

	form.watch('optionSpreadTemplate', ({ value }) => {
		form.setFieldValue(
			'optionLegs',
			getInitialOptionSpreadLegs(
				tradeOptionSpreadTemplateGroups.flatMap((group) => group.templates),
				value
			)
		);
	});

	form.watch('stockValues.side', ({ value }) => {
		form.setFieldValue('initialPosition.netEffect', value === 'long' ? 'debit' : 'credit');
	});

	return (
		<Fieldset legend="Initial Position">
			<Stack>
				{form.getValues().instrumentName === ETradeInstrumentType.OPTION ? (
					<OptionPositionFields
						spreadTemplateGroups={tradeOptionSpreadTemplateGroups ?? []}
						spreadTemplate={form.getValues().optionSpreadTemplate}
					/>
				) : (
					<StockPositionFields />
				)}
				<Grid align="flex-end">
					<Grid.Col span={{ base: 12, sm: 4 }}>
						<DateTimePicker
							key={form.key('initialPosition.dateTime')}
							label="Position Open Date & Time"
							dropdownType="modal"
							valueFormat="MM/DD/YYYY hh:mm A"
							withAsterisk
							highlightToday
							required
							{...form.getInputProps('initialPosition.dateTime')}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 12, sm: 2 }}>
						<SegmentedControl
							key={form.key('initalPosition.netEffect')}
							data={[
								{ value: 'debit', label: 'Debit' },
								{ value: 'credit', label: 'Credit' }
							]}
							fullWidth
							disabled={
								form.getValues().instrumentName === ETradeInstrumentType.STOCK
							}
							{...form.getInputProps('initialPosition.netEffect')}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 6, sm: 3 }}>
						<PriceNumberInput
							key={form.key('initialPosition.price')}
							label={`Position ${form.getValues().initialPosition.netEffect === 'credit' ? 'Credit' : 'Cost'}`}
							min={0}
							withAsterisk
							required
							{...form.getInputProps('initialPosition.price')}
						/>
					</Grid.Col>
					<Grid.Col span={{ base: 6, sm: 3 }}>
						<PriceNumberInput
							key={form.key('initialPosition.fees')}
							label="Fees"
							min={0}
							withAsterisk
							required
							{...form.getInputProps('initialPosition.fees')}
						/>
					</Grid.Col>
				</Grid>
			</Stack>
		</Fieldset>
	);
};

export default InitialPosition;
