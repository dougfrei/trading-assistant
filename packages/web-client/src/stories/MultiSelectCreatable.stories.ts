import type { Meta, StoryObj } from '@storybook/react';
import { MultiSelectCreatable } from '../components/controls/MultiSelectCreatable';

const meta = {
	title: 'Controls/MultiSelectCreatable',
	component: MultiSelectCreatable,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered'
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {
		// backgroundColor: { control: 'color' }
		placeholder: { control: 'text' }
	}
} satisfies Meta<typeof MultiSelectCreatable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		onAddNewValue: (value) => {
			console.log('onAddNewValue', value);
		},
		onAddValue: (value) => {
			console.log('onAddValue', value);
		},
		onRemoveValue: (value) => {
			console.log('onRemoveValue', value);
		}
	}
};
