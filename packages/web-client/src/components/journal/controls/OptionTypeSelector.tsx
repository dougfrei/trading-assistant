import { Select } from '@mantine/core';
import { IGqlTradeOptionSpreadTemplateGroup } from '@src/interfaces/IGqlResponses';
import { useMemo } from 'react';
import { createOptionSpreadTemplateComboboxGroups } from '../create-trade-form/position-fields/OptionPosition.util';

const OptionTypeSelector: React.FC<{
	optionSpreadTemplateGroups: IGqlTradeOptionSpreadTemplateGroup[];
	value: string;
	onChange: (value: string) => void;
	label?: string;
	allOptionTypesLabel?: string;
	disabled?: boolean;
}> = ({
	optionSpreadTemplateGroups,
	value,
	onChange,
	label = 'Option Spread Type',
	allOptionTypesLabel = 'All Option Spread Types',
	disabled = false
}) => {
	const selectItems = useMemo(
		() => createOptionSpreadTemplateComboboxGroups(optionSpreadTemplateGroups),
		[optionSpreadTemplateGroups]
	);

	return (
		<Select
			label={label}
			data={[
				{ group: allOptionTypesLabel, items: [{ label: allOptionTypesLabel, value: '' }] },
				...selectItems
			]}
			value={value}
			onChange={(newValue) => onChange(newValue ?? '')}
			disabled={disabled}
			allowDeselect={false}
		/>
	);
};

export default OptionTypeSelector;
