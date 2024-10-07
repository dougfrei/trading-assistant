import TestComponentWrapper from '@src/test/TestComponentWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AlertMessage from './AlertMessage';

describe('AlertMessage', () => {
	it('renders correctly', async () => {
		render(
			<TestComponentWrapper>
				<AlertMessage type="error">Test Error Message</AlertMessage>
			</TestComponentWrapper>
		);

		// screen.debug();

		await screen.findByRole('alert');

		expect(screen.getByRole('alert')).toHaveTextContent('Test Error Message');
	});
});
