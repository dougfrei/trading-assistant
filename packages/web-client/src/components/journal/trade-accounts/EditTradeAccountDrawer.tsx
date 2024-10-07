import { Drawer } from '@mantine/core';
import useUpdateTradeAccount from '@src/hooks/useUpdateTradingAccount';
import { IGqlTradeAccount, IGqlTradeInstrument } from '@src/interfaces/IGqlResponses';
import { useMemo } from 'react';
import TradeAccountForm from './TradeAccountForm';

const EditTradeAccountDrawer: React.FC<{
	tradeAccount: IGqlTradeAccount | null;
	onClose: () => void;
	onTradeAccountUpdated: (account: IGqlTradeAccount) => void;
	instruments: IGqlTradeInstrument[];
}> = ({ tradeAccount, onClose, onTradeAccountUpdated, instruments }) => {
	const { updateTradeAccount, updateTradeAccountError, isUpdatingTradeAccount } =
		useUpdateTradeAccount(onTradeAccountUpdated);
	const initialValues = useMemo(
		() => ({
			label: tradeAccount?.label ?? '',
			supportedInstruments: tradeAccount?.supportedInstruments ?? []
		}),
		[tradeAccount]
	);

	return (
		<Drawer
			opened={tradeAccount !== null}
			onClose={() => {
				onClose();
			}}
			title="Edit Trade Account"
			padding="lg"
			size="lg"
			position="right"
			closeOnClickOutside={!isUpdatingTradeAccount}
			closeOnEscape={!isUpdatingTradeAccount}
			withCloseButton={!isUpdatingTradeAccount}
		>
			<TradeAccountForm
				instruments={instruments}
				onSubmit={(values) => {
					if (!tradeAccount) {
						return;
					}

					updateTradeAccount(tradeAccount.id, {
						label: values.label,
						supportedInstruments: values.supportedInstruments
					});
				}}
				onCancel={onClose}
				disableControls={isUpdatingTradeAccount}
				submitButtonText="Save Changes"
				showCancelButton={true}
				errorMessage={updateTradeAccountError?.message ?? ''}
				initialValues={initialValues}
			/>
		</Drawer>
	);
};

export default EditTradeAccountDrawer;
