import { Button, Divider, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import AlertMessage from '@src/components/ui/AlertMessage';
import useUpdateTradeTag from '@src/hooks/useUpdateTradeTag';
import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { useCallback, useEffect } from 'react';

interface IEditTradeTagFormValues {
	label: string;
}

const EditTradeTagModal: React.FC<{
	tradeTagRecord: IGqlTradeTag | null;
	onClose: () => void;
	onUpdated: (updatedTradeTag: IGqlTradeTag) => void;
}> = ({ tradeTagRecord, onClose, onUpdated }) => {
	const { updateTradeTag, isUpdatingTradeTag, updateTradeTagError, resetUpdateTradeTagStatus } =
		useUpdateTradeTag((updatedTradeTag) => onUpdated(updatedTradeTag));
	const form = useForm<IEditTradeTagFormValues>({
		mode: 'uncontrolled',
		initialValues: {
			label: tradeTagRecord?.label ?? ''
		},
		validate: {
			label: (value) => (value.trim().length > 0 ? null : 'Please enter a valid label')
		}
	});

	// reset the mutation status whenever the tradeTagRecord is changed
	useEffect(() => {
		resetUpdateTradeTagStatus();
		form.setFieldValue('label', tradeTagRecord?.label ?? '');
	}, [tradeTagRecord]);

	const handleUpdateTrade = useCallback(
		(values: IEditTradeTagFormValues) => {
			if (!tradeTagRecord) {
				return;
			}

			updateTradeTag(tradeTagRecord.id, {
				label: values.label
			});
		},
		[tradeTagRecord]
	);

	return (
		<Modal
			opened={tradeTagRecord !== null}
			onClose={onClose}
			title="Edit Trade Tag"
			centered
			closeOnClickOutside={!isUpdatingTradeTag}
			closeOnEscape={!isUpdatingTradeTag}
			withCloseButton={!isUpdatingTradeTag}
		>
			<form onSubmit={form.onSubmit(handleUpdateTrade)}>
				{updateTradeTagError !== null && updateTradeTagError.message.trim().length > 0 && (
					<AlertMessage type="error" mt="sm">
						{updateTradeTagError.message.trim()}
					</AlertMessage>
				)}
				<TextInput
					data-autofocus
					withAsterisk
					label="Tag Label"
					key={form.key('label')}
					{...form.getInputProps('label')}
				/>
				<Divider mt="sm" />
				<Group justify="space-between" mt="md">
					<Button variant="default" onClick={onClose} disabled={isUpdatingTradeTag}>
						Cancel
					</Button>
					<Button type="submit" loading={isUpdatingTradeTag}>
						{isUpdatingTradeTag ? 'Updating' : 'Update'}
					</Button>
				</Group>
			</form>
		</Modal>
	);
};

export default EditTradeTagModal;
