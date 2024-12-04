import { TZDateMini } from '@date-fns/tz';
import { Button, Divider, Grid, Group, SegmentedControl, Stack } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import FormControlsDisabledContainer from '@src/components/controls/FormControlsDisabledContainer';
import PriceNumberInput from '@src/components/controls/PriceNumberInput';
import AlertMessage from '@src/components/ui/AlertMessage';
import useUpdateTrade from '@src/hooks/useUpdateTrade';
import { EGqlOptionType, IGqlTrade } from '@src/interfaces/IGqlResponses';
import ITradeOptionsValues from '@src/interfaces/ITradeOptionsValues';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';
import {
	IOptionTradePosition,
	IStockTradePosition,
	TTradePosition
} from '@trading-assistant/common/interfaces';
import { decodeOptionName, encodeOptionName } from '@trading-assistant/common/util';
import { useCallback, useEffect } from 'react';
import {
	AddPositionFormProvider,
	IAddPositionFormValues,
	useAddPositionForm
} from './AddPositionForm.context';
import OptionAddPositionFields from './OptionAddPositionFields';
import StockAddPositionFields from './StockAddPositionFields';

export interface IAddTradeValues {
	accountId: number;
	instrumentName: string;
	tickerSymbol: string;
	tagIds: number[];
	optionValues: ITradeOptionsValues | null;
}

const AddPositionForm: React.FC<{
	tradeRecord: IGqlTrade;
	tradeClosePosition?: TTradePosition | null;
	onTradeUpdated: (updatedTrade: IGqlTrade) => void;
	onCancel: () => void;
}> = ({ tradeRecord, tradeClosePosition, onTradeUpdated, onCancel }) => {
	const { updateTrade, isUpdatingTrade, updateTradeError } = useUpdateTrade(onTradeUpdated);

	const handleFormSubmit = useCallback(
		(values: IAddPositionFormValues) => {
			const newPositions = [...tradeRecord.positions];

			switch (tradeRecord.instrumentType) {
				case ETradeInstrumentType.STOCK:
					newPositions.push({
						id: crypto.randomUUID(),
						dateTime: values.newPosition.dateTime.toISOString(),
						totalAmount:
							values.newPosition.netEffect === 'credit'
								? values.newPosition.price
								: values.newPosition.price * -1,
						quantity:
							values.stockValues.action === 'buy'
								? Math.abs(values.stockValues.quantity)
								: Math.abs(values.stockValues.quantity) * -1,
						fees: values.newPosition.fees
					});
					break;

				case ETradeInstrumentType.OPTION:
					newPositions.push({
						id: crypto.randomUUID(),
						dateTime: values.newPosition.dateTime.toISOString(),
						totalAmount:
							values.newPosition.netEffect === 'credit'
								? values.newPosition.price
								: values.newPosition.price * -1,
						fees: values.newPosition.fees,
						optionLegs: values.optionLegs.map((leg) => ({
							name: encodeOptionName({
								tickerSymbol: tradeRecord.tickerSymbol,
								expirationDate: leg.expiration,
								type: leg.optionType,
								strike: leg.strike
							}),
							quantity: leg.quantity
						}))
					});
					break;

				default:
					break;
			}

			updateTrade(tradeRecord.id, { positions: newPositions });
		},
		[tradeRecord]
	);

	const form = useAddPositionForm({
		mode: 'controlled',
		initialValues: {
			stockValues: {
				action: 'buy',
				quantity: 0
			},
			optionLegs: [],
			newPosition: {
				dateTime: new Date(),
				netEffect: 'debit',
				price: 0,
				fees: 0
			}
		},
		validate: {
			stockValues: {
				quantity: (value) => {
					if (tradeRecord.instrumentType !== ETradeInstrumentType.STOCK) {
						return null;
					}

					return value === 0 ? 'Invalid value' : null;
				}
			},
			optionLegs: {
				strike: (strikeValue) => {
					if (tradeRecord.instrumentType !== ETradeInstrumentType.OPTION) {
						return null;
					}

					if (strikeValue === null || strikeValue <= 0) {
						return 'Invalid value';
					}

					return null;
				},
				quantity: (quantityValue) => {
					if (tradeRecord.instrumentType !== ETradeInstrumentType.OPTION) {
						return null;
					}

					return typeof quantityValue !== 'number' || quantityValue === 0
						? 'Invalid value'
						: null;
				}
			},
			newPosition: {
				price: (value) => (value === 0 ? 'Invalid value' : null)
			}
		}
	});

	form.watch('stockValues.action', ({ value }) => {
		form.setFieldValue('newPosition.netEffect', value === 'buy' ? 'debit' : 'credit');
	});

	useEffect(() => {
		if (tradeClosePosition) {
			switch (tradeRecord.instrumentType) {
				case ETradeInstrumentType.STOCK:
					form.setFieldValue(
						'stockValues.action',
						(tradeClosePosition as IStockTradePosition).quantity > 0 ? 'buy' : 'sell'
					);
					form.setFieldValue(
						'stockValues.quantity',
						Math.abs((tradeClosePosition as IStockTradePosition).quantity)
					);
					break;

				case ETradeInstrumentType.OPTION:
					form.setFieldValue(
						'optionLegs',
						(tradeClosePosition as IOptionTradePosition).optionLegs.map((leg) => {
							const nameParts = decodeOptionName(leg.name);

							return {
								id: tradeClosePosition.id,
								optionType: nameParts.type as EGqlOptionType,
								expiration: new TZDateMini(
									`${nameParts.expirationDate}T09:30:00`,
									'America/New_York'
								),
								strike: nameParts.strike,
								quantity: leg.quantity
							};
						})
					);
					break;

				default:
					break;
			}
		}
	}, [tradeClosePosition, tradeRecord]);

	return (
		<AddPositionFormProvider form={form}>
			<form onSubmit={form.onSubmit(handleFormSubmit)}>
				<FormControlsDisabledContainer disabled={isUpdatingTrade}>
					<Stack>
						{updateTradeError !== null && (
							<AlertMessage type="error">{updateTradeError.message}</AlertMessage>
						)}
						{tradeRecord.instrumentType === ETradeInstrumentType.OPTION ? (
							<OptionAddPositionFields />
						) : (
							<StockAddPositionFields />
						)}
						<Grid align="flex-end">
							<Grid.Col span={{ base: 12, sm: 4 }}>
								<DateTimePicker
									key={form.key('newPosition.dateTime')}
									label="Position Change Date & Time"
									dropdownType="modal"
									valueFormat="MM/DD/YYYY hh:mm A"
									withAsterisk
									highlightToday
									required
									{...form.getInputProps('newPosition.dateTime')}
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
										tradeRecord.instrumentType === ETradeInstrumentType.STOCK
									}
									{...form.getInputProps('newPosition.netEffect')}
								/>
							</Grid.Col>
							<Grid.Col span={{ base: 6, sm: 3 }}>
								<PriceNumberInput
									key={form.key('newPosition.price')}
									label={`Position ${form.getValues().newPosition.netEffect === 'credit' ? 'Credit' : 'Cost'}`}
									min={0}
									withAsterisk
									required
									{...form.getInputProps('newPosition.price')}
								/>
							</Grid.Col>
							<Grid.Col span={{ base: 6, sm: 3 }}>
								<PriceNumberInput
									key={form.key('newPosition.fees')}
									label="Fees"
									min={0}
									withAsterisk
									required
									{...form.getInputProps('newPosition.fees')}
								/>
							</Grid.Col>
						</Grid>
						<Divider />
						<Group justify="space-between">
							<Button variant="default" disabled={isUpdatingTrade} onClick={onCancel}>
								Cancel
							</Button>
							<Button type="submit" loading={isUpdatingTrade}>
								Add Position
							</Button>
						</Group>
					</Stack>
				</FormControlsDisabledContainer>
			</form>
		</AddPositionFormProvider>
	);
};

export default AddPositionForm;
