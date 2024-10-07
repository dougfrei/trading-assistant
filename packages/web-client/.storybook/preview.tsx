// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import { MantineProvider, useMantineColorScheme } from '@mantine/core';
import '@mantine/core/styles.css';
import { addons } from '@storybook/preview-api';
import React, { useEffect } from 'react';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import theme from '../src/theme';

const channel = addons.getChannel();

function ColorSchemeWrapper({ children }: React.PropsWithChildren) {
	const { setColorScheme } = useMantineColorScheme();
	const handleColorScheme = (value: boolean) => setColorScheme(value ? 'dark' : 'light');

	useEffect(() => {
		channel.on(DARK_MODE_EVENT_NAME, handleColorScheme);
		return () => channel.off(DARK_MODE_EVENT_NAME, handleColorScheme);
	}, [channel]);

	return <>{children}</>;
}

export const decorators = [
	(renderStory) => <ColorSchemeWrapper>{renderStory()}</ColorSchemeWrapper>,
	(renderStory) => <MantineProvider theme={theme}>{renderStory()}</MantineProvider>
];
