import { Loader, Title } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import useCreateTradeAccount from '@src/hooks/useCreateTradingAccount';
import useGetTradeInstruments from '@src/hooks/useGetTradeInstruments';
import { IGqlTradeAccount } from '@src/interfaces/IGqlResponses';
import TradeAccountForm from '../trade-accounts/TradeAccountForm';

const CreateTradeAccount: React.FC<{
	onAccountCreated: (account: IGqlTradeAccount) => void;
	onCancel: () => void;
	isInitialCreate?: boolean;
}> = ({ onAccountCreated, onCancel, isInitialCreate = true }) => {
	const {
		tradeInstruments,
		loading: loadingInstruments,
		error: instrumentsError
	} = useGetTradeInstruments();
	const { createTradeAccount, createTradeAccountError, isCreatingTradeAccount } =
		useCreateTradeAccount(onAccountCreated);

	if (loadingInstruments) {
		return <Loader />;
	}

	if (instrumentsError) {
		return (
			<AlertMessage type="error">
				An error occurred while loading the available trade instruments:{' '}
				{instrumentsError.message}
			</AlertMessage>
		);
	}

	return (
		<>
			<Title order={2}>Create a Trading Account</Title>
			{isInitialCreate && (
				<p>
					Before we can get started entering your first trade, we need to create a trading
					account.
				</p>
			)}
			<TradeAccountForm
				instruments={tradeInstruments}
				onSubmit={(values) => {
					createTradeAccount({
						label: values.label,
						supportedInstruments: values.supportedInstruments
					});
				}}
				onCancel={onCancel}
				disableControls={isCreatingTradeAccount}
				submitButtonText="Create Account"
				showCancelButton={!isInitialCreate}
				errorMessage={createTradeAccountError?.message ?? ''}
			/>
		</>
	);
};

export default CreateTradeAccount;
