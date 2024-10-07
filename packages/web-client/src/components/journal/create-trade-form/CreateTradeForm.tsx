import { Button, Divider, Group, Stack } from '@mantine/core';
import FormControlsDisabledContainer from '@src/components/controls/FormControlsDisabledContainer';
import AlertMessage from '@src/components/ui/AlertMessage';
import useCreateTrade from '@src/hooks/useCreateTrade';
import { IGqlTrade } from '@src/interfaces/IGqlResponses';
import ITradeOptionsValues from '@src/interfaces/ITradeOptionsValues';
import { ICreateTradeRouteData } from '@src/route-loaders/create-trade';
import { useLoaderData } from '@tanstack/react-router';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';
import { TTradePositionCreatable } from '@trading-assistant/common/interfaces';
import { encodeOptionName } from '@trading-assistant/common/util';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CreateTradeAccount from './CreateTradeAccount';
import {
	CreateTradeFormProvider,
	ICreateTradeFormValues,
	useCreateTradeForm
} from './CreateTradeForm.context';
import {
	getInitialOptionSpreadLegs,
	validateOptionLegExpirationValue,
	validateOptionLegStrikeValue
} from './position-fields/OptionPosition.util';
import AccountAndInstrument from './steps/AccountAndInstrument';
import InitialPosition from './steps/InitialPosition';
import StopLossAndProfitTargets from './steps/StopLossAndProfitTargets';
import TagsAndNotes from './steps/TagsAndNotes';

export interface IAddTradeValues {
	accountId: number;
	instrumentName: string;
	tickerSymbol: string;
	tagIds: number[];
	optionValues: ITradeOptionsValues | null;
}

const CreateTradeForm: React.FC<{ onTradeCreated: (createdTrade: IGqlTrade) => void }> = ({
	onTradeCreated
}) => {
	const loaderData = useLoaderData({
		from: '/_app/journal/add'
	}) as ICreateTradeRouteData;
	const [tradeAccounts, setTradeAccounts] = useState(loaderData.tradeAccounts);
	const [setupTags, setSetupTags] = useState(loaderData.tradeTags);
	const tradeOptionSpreadTemplatesByName = useMemo(
		() =>
			new Map(
				loaderData.tradeOptionSpreadTemplateGroups
					.flatMap((group) => group.templates)
					.map((template) => [template.name, template])
			),
		[loaderData.tradeOptionSpreadTemplateGroups]
	);
	const [showCreateAccount, setShowCreateAccount] = useState(
		loaderData.tradeAccounts.length === 0
	);
	const { createTrade, isCreatingTrade, createTradeError } = useCreateTrade(onTradeCreated);

	// scroll to the top when an new error is shown
	useEffect(() => {
		if (createTradeError) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}, [createTradeError]);

	const handleFormSubmit = useCallback((values: ICreateTradeFormValues) => {
		if (values.instrumentName === null) {
			return;
		}

		let positions: TTradePositionCreatable[] = [];

		switch (values.instrumentName) {
			case ETradeInstrumentType.STOCK:
				positions = [
					{
						dateTime: values.initialPosition.dateTime.toISOString(),
						totalAmount:
							values.initialPosition.netEffect === 'credit'
								? values.initialPosition.price
								: values.initialPosition.price * -1,
						quantity: values.stockValues.quantity,
						fees: values.initialPosition.fees
					}
				];
				break;

			case ETradeInstrumentType.OPTION:
				positions = [
					{
						dateTime: values.initialPosition.dateTime.toISOString(),
						optionLegs: values.optionLegs.map((leg) => ({
							name: encodeOptionName({
								tickerSymbol: values.tickerSymbol,
								expirationDate: leg.expiration,
								type: leg.optionType,
								strike: leg.strike
							}),
							quantity: leg.quantity
						})),
						fees: values.initialPosition.fees,
						totalAmount:
							values.initialPosition.netEffect === 'credit'
								? values.initialPosition.price
								: values.initialPosition.price * -1
					}
				];
				break;

			default:
				break;
		}

		createTrade({
			accountId: parseInt(values.accountId),
			instrumentType: values.instrumentName,
			tickerSymbol: values.tickerSymbol,
			stopLossLevels: values.stopLosses,
			profitTargetLevels: values.profitTargets,
			tagIds: values.setupTagIds,
			notes: values.notes,
			positions,
			optionSpreadTemplate:
				values.instrumentName === ETradeInstrumentType.OPTION
					? values.optionSpreadTemplate
					: ''
		});
	}, []);

	const initialAccountId = tradeAccounts[0]?.id ?? 0;
	const initialInstrumentName = useMemo(
		() =>
			tradeAccounts.find((account) => account.id === initialAccountId)?.instruments[0]
				?.name ?? null,
		[initialAccountId, tradeAccounts]
	);

	const form = useCreateTradeForm({
		mode: 'controlled',
		initialValues: {
			accountId: initialAccountId.toString(),
			instrumentName: initialInstrumentName,
			tickerSymbol: '',
			stockValues: {
				side: 'long',
				quantity: 0
			},
			optionSpreadTemplate: '',
			optionLegs: getInitialOptionSpreadLegs([], ''),
			initialPosition: {
				dateTime: new Date(),
				netEffect: 'debit',
				price: 0,
				fees: 0
			},
			notes: '',
			stopLosses: [],
			profitTargets: [],
			setupTagIds: []
		},
		validate: {
			accountId: (value) => (value === '' ? 'Please select an account' : null),
			instrumentName: (value) => (value === null ? 'Please select an instrument' : null),
			tickerSymbol: (value) =>
				(value ?? '').trim().length === 0 ? 'Please enter a ticker symbol' : null,
			stockValues: {
				quantity: (value, allValues) => {
					if (allValues.instrumentName !== ETradeInstrumentType.STOCK) {
						return null;
					}

					return value === 0 ? 'Invalid value' : null;
				}
			},
			optionLegs: {
				expiration: (expirationValue, allValues, fieldPath) => {
					if (allValues.instrumentName !== ETradeInstrumentType.OPTION) {
						return null;
					}

					const rowIndex = parseInt(fieldPath.split('.')[1] ?? '-1');
					const template = tradeOptionSpreadTemplatesByName.get(
						allValues.optionSpreadTemplate
					);

					if (!template) {
						return null;
					}

					const [isValid, errorMessage] = validateOptionLegExpirationValue(
						allValues.optionLegs,
						rowIndex,
						template
					);

					return isValid ? null : errorMessage;
				},
				strike: (strikeValue, allValues, fieldPath) => {
					if (allValues.instrumentName !== ETradeInstrumentType.OPTION) {
						return null;
					}

					if (strikeValue === null || strikeValue <= 0) {
						return 'Invalid value';
					}

					const rowIndex = parseInt(fieldPath.split('.')[1] ?? '-1');
					const template = tradeOptionSpreadTemplatesByName.get(
						allValues.optionSpreadTemplate
					);

					if (!template) {
						return null;
					}

					const [isValid, errorMessage] = validateOptionLegStrikeValue(
						allValues.optionLegs,
						rowIndex,
						template
					);

					return isValid ? null : errorMessage;
				},
				quantity: (quantityValue, allValues) => {
					if (allValues.instrumentName !== ETradeInstrumentType.OPTION) {
						return null;
					}

					return typeof quantityValue !== 'number' || quantityValue === 0
						? 'Invalid value'
						: null;
				}
			},
			initialPosition: {
				price: (value) => (value === 0 ? 'Invalid value' : null)
			}
		}
	});

	return showCreateAccount ? (
		<CreateTradeAccount
			onAccountCreated={(newAccount) => {
				setShowCreateAccount(false);
				setTradeAccounts((curAccounts) => [...curAccounts, newAccount]);
			}}
			onCancel={() => setShowCreateAccount(false)}
			isInitialCreate={tradeAccounts.length === 0}
		/>
	) : (
		<CreateTradeFormProvider form={form}>
			<form onSubmit={form.onSubmit(handleFormSubmit)}>
				<FormControlsDisabledContainer disabled={isCreatingTrade}>
					<Stack maw={{ lg: 900 }}>
						{createTradeError !== null && (
							<AlertMessage type="error">{createTradeError.message}</AlertMessage>
						)}
						<AccountAndInstrument
							tradeAccounts={tradeAccounts}
							onCreateAccount={() => setShowCreateAccount(true)}
						/>
						<InitialPosition
							tradeOptionSpreadTemplateGroups={
								loaderData.tradeOptionSpreadTemplateGroups
							}
						/>
						<StopLossAndProfitTargets />
						<TagsAndNotes
							setupTags={setupTags}
							onNewTagCreated={(newTag) =>
								setSetupTags((curTags) => [...curTags, newTag])
							}
						/>
						<Divider />
						<Group justify="flex-end">
							<Button type="submit" loading={isCreatingTrade}>
								Create Trade
							</Button>
						</Group>
					</Stack>
				</FormControlsDisabledContainer>
			</form>
		</CreateTradeFormProvider>
	);
};

export default CreateTradeForm;
