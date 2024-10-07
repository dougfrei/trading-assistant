import { Drawer } from '@mantine/core';
import useCreateTradeAccount from '@src/hooks/useCreateTradingAccount';
import { IGqlTradeAccount, IGqlTradeInstrument } from '@src/interfaces/IGqlResponses';
import TradeAccountForm from './TradeAccountForm';

const CreateTradeAccountDrawer: React.FC<{
	isOpen: boolean;
	onClose: () => void;
	onTradeAccountCreated: (account: IGqlTradeAccount) => void;
	instruments: IGqlTradeInstrument[];
}> = ({ isOpen, onClose, onTradeAccountCreated, instruments }) => {
	const { createTradeAccount, createTradeAccountError, isCreatingTradeAccount } =
		useCreateTradeAccount(onTradeAccountCreated);

	return (
		<Drawer
			opened={isOpen}
			onClose={() => {
				onClose();
			}}
			title="Create Trade Account"
			padding="lg"
			size="lg"
			position="right"
			closeOnClickOutside={!isCreatingTradeAccount}
			closeOnEscape={!isCreatingTradeAccount}
			withCloseButton={!isCreatingTradeAccount}
		>
			<TradeAccountForm
				instruments={instruments}
				onSubmit={(values) => {
					createTradeAccount({
						label: values.label,
						supportedInstruments: values.supportedInstruments
					});
				}}
				onCancel={onClose}
				disableControls={isCreatingTradeAccount}
				submitButtonText="Create Account"
				showCancelButton={true}
				errorMessage={createTradeAccountError?.message ?? ''}
			/>
		</Drawer>
	);
};

export default CreateTradeAccountDrawer;
