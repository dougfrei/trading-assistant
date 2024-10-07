import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';
import { MultiSelectCreatable } from '../components/controls/MultiSelectCreatable';

const MultiSelectCreatableControlled: React.FC<{
	placeholder?: string;
	isLoading?: boolean;
	disabled?: boolean;
	label?: string;
}> = ({ placeholder = '', isLoading = false, disabled = false, label = '' }) => {
	const [data, setData] = useState(['Against trend', 'Downward trendline break up']);
	const [values, setValues] = useState<string[]>([]);

	const handleAddNewValue = useCallback((newValue: string) => {
		setData((current) => [...current, newValue]);
		setValues((current) =>
			current.includes(newValue)
				? current.filter((v) => v !== newValue)
				: [...current, newValue]
		);
	}, []);

	const handleAddValue = useCallback((newValue: string) => {
		setValues((current) =>
			current.includes(newValue)
				? current.filter((v) => v !== newValue)
				: [...current, newValue]
		);
	}, []);

	const handleRemoveValue = useCallback((removeValue: string) => {
		setValues((current) => current.filter((v) => v !== removeValue));
	}, []);

	return (
		<MultiSelectCreatable
			data={data}
			values={values}
			onAddNewValue={handleAddNewValue}
			onAddValue={handleAddValue}
			onRemoveValue={handleRemoveValue}
			placeholder={placeholder}
			isLoading={isLoading}
			disabled={disabled}
			label={label}
		/>
	);
};

const meta = {
	title: 'Controls/MultiSelectCreatableControlled',
	component: MultiSelectCreatableControlled,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered'
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {
		// backgroundColor: { control: 'color' }
		placeholder: { control: 'text' },
		isLoading: { control: 'boolean' },
		disabled: { control: 'boolean' },
		label: { control: 'text' }
	}
} satisfies Meta<typeof MultiSelectCreatableControlled>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {}
};
