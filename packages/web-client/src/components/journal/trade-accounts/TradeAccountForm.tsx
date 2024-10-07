import { Button, Checkbox, Divider, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import FormControlsDisabledContainer from '@src/components/controls/FormControlsDisabledContainer';
import AlertMessage from '@src/components/ui/AlertMessage';
import { IGqlTradeInstrument } from '@src/interfaces/IGqlResponses';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';

interface ITradeAccountFormValues {
	label: string;
	supportedInstruments: ETradeInstrumentType[];
}

const TradeAccountForm: React.FC<{
	instruments: IGqlTradeInstrument[];
	onSubmit: (values: ITradeAccountFormValues) => void;
	onCancel: () => void;
	disableControls?: boolean;
	submitButtonText?: string;
	showCancelButton?: boolean;
	errorMessage?: string;
	initialValues?: ITradeAccountFormValues;
}> = ({
	instruments,
	onSubmit,
	onCancel,
	disableControls = false,
	submitButtonText = 'Create Account',
	showCancelButton = true,
	errorMessage = '',
	initialValues = { label: '', supportedInstruments: [] }
}) => {
	const form = useForm<ITradeAccountFormValues>({
		mode: 'uncontrolled',
		initialValues: {
			label: initialValues.label,
			supportedInstruments: initialValues.supportedInstruments
		},
		validate: {
			label: (value) => (value.trim() === '' ? 'Please enter a label' : null),
			supportedInstruments: (value) =>
				value.length === 0 ? 'Please select at least one supported instrument' : null
		}
	});

	const handleFormSubmit = async (values: ITradeAccountFormValues) => {
		onSubmit({
			label: values.label,
			supportedInstruments: values.supportedInstruments
		});
	};

	return (
		<form onSubmit={form.onSubmit(handleFormSubmit)} data-testid="trade-account-form">
			{errorMessage.length > 0 && <AlertMessage type="error">{errorMessage}</AlertMessage>}
			<FormControlsDisabledContainer disabled={disableControls}>
				<Stack gap="md">
					<TextInput
						label="Display Label"
						withAsterisk
						key={form.key('label')}
						autoFocus
						data-autofocus
						{...form.getInputProps('label')}
					/>
					<Checkbox.Group
						key={form.key('supportedInstruments')}
						label="Select the supported instruments"
						withAsterisk
						{...form.getInputProps('supportedInstruments')}
					>
						<Group>
							{instruments.map((instrument) => {
								return (
									<Checkbox
										key={instrument.name}
										value={instrument.name}
										label={instrument.label}
										mt="xs"
										mb="xs"
									/>
								);
							})}
						</Group>
					</Checkbox.Group>
				</Stack>
			</FormControlsDisabledContainer>
			<Divider mt="lg" />
			<Group justify={showCancelButton ? 'space-between' : 'flex-end'} mt="lg">
				{showCancelButton && (
					<Button variant="light" disabled={disableControls} onClick={onCancel}>
						Cancel
					</Button>
				)}
				<Button type="submit" loading={disableControls}>
					{submitButtonText}
				</Button>
			</Group>
		</form>
	);
};

export default TradeAccountForm;
