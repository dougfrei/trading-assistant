import { Select, Stack } from '@mantine/core';
import { useState } from 'react';
import RiskCalculatorStock from './RiskCalculatorStock';

enum ERiskCalculatorInstrumentType {
	STOCKS = 'stocks',
	OPTIONS = 'options',
	FUTURES = 'futures',
	CRYPTO = 'crypto'
}

const RiskCalculator: React.FC = () => {
	const [instrumentType, setInstrumentType] = useState(ERiskCalculatorInstrumentType.STOCKS);

	let ChildComponent: React.ReactNode | null = null;

	switch (instrumentType) {
		case ERiskCalculatorInstrumentType.STOCKS:
			ChildComponent = <RiskCalculatorStock></RiskCalculatorStock>;
			break;

		default:
			break;
	}

	return (
		<Stack gap="md">
			<Select
				label="Instrument Type"
				data={[
					{ value: ERiskCalculatorInstrumentType.STOCKS, label: 'Stocks' }
					// NOTE: These are placeholders for future risk calculator functionality
					// { value: ERiskCalculatorInstrumentType.OPTIONS, label: 'Options' },
					// { value: ERiskCalculatorInstrumentType.FUTURES, label: 'Futures' }
					// { value: ERiskCalculatorInstrumentType.CRYPTO, label: 'Crypto' }
				]}
				value={instrumentType}
				onChange={(value) => {
					setInstrumentType(value as ERiskCalculatorInstrumentType);
				}}
				allowDeselect={false}
			/>
			{ChildComponent}
		</Stack>
	);
};

export default RiskCalculator;
