import { Loader, Modal } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import useCalculateTradeClosePosition from '@src/hooks/useCalculateTradeClosePosition';
import { IGqlTrade } from '@src/interfaces/IGqlResponses';
import AddPositionForm from './add-position-form/AddPositionForm';

const AddTradePositionModal: React.FC<{
	tradeRecord: IGqlTrade | null;
	onClose: () => void;
	onPositionAdded: (trade: IGqlTrade) => void;
}> = ({ tradeRecord, onClose, onPositionAdded }) => {
	const {
		isCalculatingTradeClosePosition,
		calculateTradeClosePositionError,
		tradeClosePosition
	} = useCalculateTradeClosePosition(tradeRecord?.id ?? 0);

	const isUpdatingTrade = false;

	return (
		<Modal
			opened={tradeRecord !== null}
			onClose={onClose}
			title="Add Trade Position"
			padding="lg"
			size="auto"
			closeOnClickOutside={!isUpdatingTrade}
			closeOnEscape={!isUpdatingTrade}
			withCloseButton={!isUpdatingTrade}
		>
			{isCalculatingTradeClosePosition ? (
				<Loader />
			) : (
				<>
					{calculateTradeClosePositionError !== null && (
						<AlertMessage type="error">
							{calculateTradeClosePositionError.message}
						</AlertMessage>
					)}
					{tradeRecord !== null && (
						<AddPositionForm
							tradeRecord={tradeRecord}
							tradeClosePosition={tradeClosePosition}
							onTradeUpdated={onPositionAdded}
							onCancel={onClose}
						/>
					)}
				</>
			)}
		</Modal>
	);
};

export default AddTradePositionModal;
