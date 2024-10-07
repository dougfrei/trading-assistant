import TestComponentWrapper from '@src/test/TestComponentWrapper';
import { fireEvent, render, screen } from '@testing-library/react';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';
import { describe, expect, it, vi } from 'vitest';
import TradeAccountForm from './TradeAccountForm';

describe('TradeAccountForm', () => {
	it('should return values correctly', async () => {
		const onCancelMock = vi.fn();
		const onSubmitMock = vi.fn();

		render(
			<TestComponentWrapper>
				<TradeAccountForm
					instruments={[
						{ name: ETradeInstrumentType.STOCK, label: 'Stocks' },
						{ name: ETradeInstrumentType.OPTION, label: 'Options' }
					]}
					onSubmit={onSubmitMock}
					onCancel={onCancelMock}
					submitButtonText="Create Account"
				/>
			</TestComponentWrapper>
		);

		fireEvent.change(screen.getByLabelText(/display label/i), {
			target: { value: 'Test Label' }
		});

		fireEvent.click(screen.getByLabelText(/stocks/i));
		fireEvent.click(screen.getByLabelText(/options/i));

		fireEvent.click(screen.getByText('Create Account'));

		// the submit callback should have been called with the expected object
		expect(onSubmitMock).toHaveBeenCalledWith({
			label: 'Test Label',
			supportedInstruments: [ETradeInstrumentType.STOCK, ETradeInstrumentType.OPTION]
		});
	});

	it('should fail to return values while having an empty label field', async () => {
		const onCancelMock = vi.fn();
		const onSubmitMock = vi.fn();

		render(
			<TestComponentWrapper>
				<TradeAccountForm
					instruments={[
						{ name: ETradeInstrumentType.STOCK, label: 'Stocks' },
						{ name: ETradeInstrumentType.OPTION, label: 'Options' }
					]}
					onSubmit={onSubmitMock}
					onCancel={onCancelMock}
					submitButtonText="Create Account"
				/>
			</TestComponentWrapper>
		);

		fireEvent.click(screen.getByLabelText(/stocks/i));
		fireEvent.click(screen.getByLabelText(/options/i));

		fireEvent.click(screen.getByText('Create Account'));

		// the error message should exist
		await screen.getByText('Please enter a label');

		// the submit callback should not have been called
		expect(onSubmitMock).toHaveBeenCalledTimes(0);
	});

	it('should fail to return values while having no instrument selections', async () => {
		const onCancelMock = vi.fn();
		const onSubmitMock = vi.fn();

		render(
			<TestComponentWrapper>
				<TradeAccountForm
					instruments={[
						{ name: ETradeInstrumentType.STOCK, label: 'Stocks' },
						{ name: ETradeInstrumentType.OPTION, label: 'Options' }
					]}
					onSubmit={onSubmitMock}
					onCancel={onCancelMock}
					submitButtonText="Create Account"
				/>
			</TestComponentWrapper>
		);

		fireEvent.change(screen.getByLabelText(/display label/i), {
			target: { value: 'Test Label' }
		});

		fireEvent.click(screen.getByText('Create Account'));

		// the error message should exist
		await screen.getByText('Please select at least one supported instrument');

		// the submit callback should not have been called
		expect(onSubmitMock).toHaveBeenCalledTimes(0);
	});
});
