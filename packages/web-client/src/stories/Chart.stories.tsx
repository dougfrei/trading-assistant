import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Chart from '../components/chart/Chart';
import ICandle from '../interfaces/ICandle';

const meta = {
	title: 'Charts/Chart',
	component: Chart,
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
	// render: (args, { loaded: { candles } }) => <Chart {...args} candles={candles} />
	render: (args, { loaded: { candles } }) => {
		const [activeCandles, setActiveCandles] = useState<ICandle[]>(candles);

		return (
			<Chart
				{...args}
				candles={activeCandles}
				onRequestAdditionalData={async (currentFirstPeriod) => {
					const newCandles = await getCandles(currentFirstPeriod);

					setActiveCandles((curCandles) => [...newCandles, ...curCandles]);
				}}
			/>
		);
	}
} satisfies Meta<typeof Chart>;

export default meta;

type Story = StoryObj<typeof meta>;

const getCandles = async (beforeDate: Date | null = null, limit = 200) => {
	try {
		const candlesRes = await fetch('./test-data/spy-test-candles.json');
		let candlesJson = (await candlesRes.json()) as ICandle[];

		if (beforeDate) {
			const beforeDateTimestamp = beforeDate.getTime();

			candlesJson = candlesJson.filter((candle) => candle.period < beforeDateTimestamp);
		}

		if (limit) {
			candlesJson = candlesJson.slice(candlesJson.length - limit);
		}

		return candlesJson;
	} catch (err) {
		console.error(err);

		return [];
	}
};

const candlesLoader = async () => {
	try {
		const candles = await getCandles();

		return {
			candles
		};
	} catch (err) {
		console.error(err);

		return {
			candles: []
		};
	}
};

export const Basic: Story = {
	args: {
		candles: []
		/* onRequestAdditionalData: async (currentFirstPeriod) => {
			const newCandles = await getCandles(currentFirstPeriod);

			console.log(newCandles);
		} */
	},
	loaders: [candlesLoader]
};

export const WithVolume: Story = {
	args: {
		candles: [],
		showVolume: true
	},
	loaders: [candlesLoader]
};
