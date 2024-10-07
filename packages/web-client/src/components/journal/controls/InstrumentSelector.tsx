import { Select } from '@mantine/core';
import { IGqlTradeInstrument } from '@src/interfaces/IGqlResponses';

const InstrumentSelector: React.FC<{
	instruments: IGqlTradeInstrument[];
	value: string;
	onChange: (value: string) => void;
	label?: string;
	allOptionLabel?: string;
	disabled?: boolean;
}> = ({
	instruments,
	value,
	onChange,
	label = 'Instrument',
	allOptionLabel = 'All Instruments',
	disabled = false
}) => {
	return (
		<Select
			label={label}
			data={[
				{ value: '', label: allOptionLabel },
				...instruments.map((instrument) => ({
					value: instrument.name,
					label: instrument.label
				}))
			]}
			value={value.toString()}
			onChange={(newValue) => onChange(newValue ?? '')}
			disabled={disabled}
			allowDeselect={false}
		/>
	);
};

export default InstrumentSelector;
