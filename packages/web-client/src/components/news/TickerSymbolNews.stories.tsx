import { IGqlTickerSymbolNews } from '@src/interfaces/IGqlResponses';
import type { Meta, StoryObj } from '@storybook/react';
import TickerSymbolNews from './TickerSymbolNews';

const meta = {
	title: 'Components/TickerSymbolNews',
	component: TickerSymbolNews,
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	render: (args, { loaded: { records } }) => <TickerSymbolNews {...args} records={records} />
} satisfies Meta<typeof TickerSymbolNews>;

export default meta;

type Story = StoryObj<typeof meta>;

const getRecords = async () => {
	try {
		const response = await fetch('./test-data/ticker-symbol-news.json');
		const newsRecords = (await response.json()) as IGqlTickerSymbolNews[];

		return newsRecords;
	} catch (err) {
		console.error(err);

		return [];
	}
};

const mockDataLoader = async () => {
	try {
		const records = await getRecords();

		return {
			records
		};
	} catch (err) {
		console.error(err);

		return {
			records: []
		};
	}
};

export const Default: Story = {
	args: {
		records: []
	},
	loaders: [mockDataLoader]
};
