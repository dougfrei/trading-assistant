import { NumberInput, NumberInputProps } from '@mantine/core';
import { IconCurrencyDollar } from '@tabler/icons-react';
import { forwardRef } from 'react';

const PriceNumberInput = forwardRef<HTMLInputElement, NumberInputProps>((props, ref) => {
	return (
		<NumberInput
			ref={ref}
			hideControls
			leftSection={<IconCurrencyDollar size={14} width={26} />}
			decimalScale={2}
			min={0.01}
			step={0.01}
			{...props}
		/>
	);
});

export default PriceNumberInput;
