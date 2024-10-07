import { MantineProvider } from '@mantine/core';
import React from 'react';
import theme from '../theme';

const TestComponentWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<MantineProvider defaultColorScheme="dark" theme={theme}>
			{children}
		</MantineProvider>
	);
};

export default TestComponentWrapper;
