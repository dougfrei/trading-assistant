import { CheckIcon, Combobox, Group, Loader, Pill, PillsInput, useCombobox } from '@mantine/core';
import { useState } from 'react';

export const MultiSelectCreatable: React.FC<{
	data?: string[];
	values?: string[];
	placeholder?: string;
	isLoading?: boolean;
	disabled?: boolean;
	label?: string;
	onAddNewValue: (value: string) => void;
	onAddValue: (value: string) => void;
	onRemoveValue: (value: string) => void;
}> = ({
	data = [],
	values = [],
	placeholder = '',
	isLoading = false,
	disabled = false,
	label = '',
	onAddNewValue,
	onAddValue,
	onRemoveValue
}) => {
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex('active')
	});

	const [search, setSearch] = useState('');

	const exactOptionMatch = data.some((item) => item === search);

	const handleValueSelect = async (val: string) => {
		setSearch('');

		if (val === '$create') {
			onAddNewValue(search);
		} else {
			onAddValue(val);
		}
	};

	const renderValues = values.map((item) => (
		<Pill key={item} withRemoveButton onRemove={() => onRemoveValue(item)} disabled={disabled}>
			{item}
		</Pill>
	));

	const options = data
		.filter((item) => item.toLowerCase().includes(search.trim().toLowerCase()))
		.map((item) => (
			<Combobox.Option value={item} key={item} active={values.includes(item)}>
				<Group gap="sm">
					{values.includes(item) ? <CheckIcon size={12} /> : null}
					<span>{item}</span>
				</Group>
			</Combobox.Option>
		));

	return (
		<>
			<Combobox
				store={combobox}
				onOptionSubmit={handleValueSelect}
				withinPortal={false}
				disabled={disabled}
			>
				<Combobox.DropdownTarget>
					<PillsInput
						onClick={() => combobox.openDropdown()}
						rightSection={isLoading ? <Loader size={20} /> : null}
						disabled={disabled}
						label={label}
					>
						<Pill.Group>
							{renderValues}

							<Combobox.EventsTarget>
								<PillsInput.Field
									onFocus={() => combobox.openDropdown()}
									onBlur={() => combobox.closeDropdown()}
									value={search}
									placeholder={placeholder}
									onChange={(event) => {
										combobox.updateSelectedOptionIndex();
										setSearch(event.currentTarget.value);
									}}
									onKeyDown={(event) => {
										if (event.key === 'Backspace' && search.length === 0) {
											event.preventDefault();

											onRemoveValue(values[values.length - 1]);
										}
									}}
									disabled={disabled}
								/>
							</Combobox.EventsTarget>
						</Pill.Group>
					</PillsInput>
				</Combobox.DropdownTarget>

				<Combobox.Dropdown>
					<Combobox.Options>
						{options}

						{!exactOptionMatch && search.trim().length > 0 && (
							<Combobox.Option value="$create">+ Add "{search}"</Combobox.Option>
						)}

						{exactOptionMatch && search.trim().length > 0 && options.length === 0 && (
							<Combobox.Empty>Nothing found</Combobox.Empty>
						)}
					</Combobox.Options>
				</Combobox.Dropdown>
			</Combobox>
		</>
	);
};
