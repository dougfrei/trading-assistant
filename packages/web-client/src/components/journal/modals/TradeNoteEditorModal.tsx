import { Button, Divider, Group, Modal, Stack, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import FormControlsDisabledContainer from '@src/components/controls/FormControlsDisabledContainer';
import AlertMessage from '@src/components/ui/AlertMessage';
import { useTradesListContext } from '@src/hooks/useTradesListContext';
import useUpdateTrade, { IUpdateTradeParams } from '@src/hooks/useUpdateTrade';
import { IGqlTrade, IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { capitalizeString } from '@src/util/strings';
import { useCallback, useEffect, useMemo } from 'react';
import TagSelector from '../controls/TagSelector';
import {
	getTradeNoteEditorModalSaveText,
	getTradeNoteEditorModalTitle,
	getTradeTagTypeForNoteTagType
} from './TradeNoteEditorModal.util';

interface ITradeNoteEditorFormValues {
	content: string;
	tagIds: number[];
}

const TradeNoteEditorModal: React.FC<{
	availableTradeTags: IGqlTradeTag[];
	onTagCreated: (tag: IGqlTradeTag) => void;
	onClose: () => void;
	onTradeUpdated: (updatedTrade: IGqlTrade) => void;
}> = ({ availableTradeTags, onTagCreated, onClose, onTradeUpdated }) => {
	const { editTradeNoteState } = useTradesListContext();
	const { updateTrade, isUpdatingTrade, updateTradeError, resetUpdateTradeStatus } =
		useUpdateTrade(onTradeUpdated);

	const handleSubmit = useCallback(
		(values: ITradeNoteEditorFormValues) => {
			if (!editTradeNoteState) {
				return;
			}

			const updateParams: IUpdateTradeParams = {
				notes: []
			};

			if (editTradeNoteState.tradeNote.id) {
				// editing existing record
				const existingIndex = editTradeNoteState.tradeRecord.notes.findIndex(
					(note) => note.id === editTradeNoteState.tradeNote.id
				);

				if (existingIndex >= 0) {
					updateParams.notes = editTradeNoteState.tradeRecord.notes.with(existingIndex, {
						...editTradeNoteState.tradeRecord.notes[existingIndex],
						content: values.content
					});
				}
			} else {
				// creating new record
				updateParams.notes = [
					...editTradeNoteState.tradeRecord.notes,
					{
						...editTradeNoteState.tradeNote,
						content: values.content
					}
				];
			}

			// update setup/review tags if necessary
			const removeTagType = getTradeTagTypeForNoteTagType(editTradeNoteState.tradeNote.type);

			if (removeTagType) {
				const preserveTagIds = editTradeNoteState.tradeRecord.tags
					.filter((tag) => tag.type !== removeTagType)
					.map((tag) => tag.id);

				updateParams.tagIds = [...preserveTagIds, ...values.tagIds];
			}

			updateTrade(editTradeNoteState.tradeRecord.id, updateParams);
		},
		[editTradeNoteState, availableTradeTags, updateTrade]
	);

	const form = useForm<ITradeNoteEditorFormValues>({
		mode: 'controlled',
		initialValues: {
			content: '',
			tagIds: []
		},
		validate: {
			content: (value) => (value.trim().length > 0 ? null : 'This field is required')
		}
	});

	useEffect(() => {
		resetUpdateTradeStatus();
		form.reset();

		const matchTagType = getTradeTagTypeForNoteTagType(editTradeNoteState?.tradeNote.type);

		form.setFieldValue('content', editTradeNoteState?.tradeNote.content ?? '');
		form.setFieldValue(
			'tagIds',
			(editTradeNoteState?.tradeRecord.tags ?? []).reduce<number[]>((acum, tag) => {
				if (tag.type === matchTagType) {
					acum.push(tag.id);
				}

				return acum;
			}, [])
		);
	}, [editTradeNoteState, resetUpdateTradeStatus]);

	const selectableTags = useMemo(() => {
		if (!editTradeNoteState) {
			return [];
		}

		const matchTagType = getTradeTagTypeForNoteTagType(editTradeNoteState?.tradeNote.type);

		return availableTradeTags.filter((tag) => tag.type === matchTagType);
	}, [availableTradeTags, editTradeNoteState]);

	const tagSelectorType = getTradeTagTypeForNoteTagType(editTradeNoteState?.tradeNote.type);

	return (
		<Modal
			opened={editTradeNoteState !== null}
			onClose={onClose}
			title={getTradeNoteEditorModalTitle(editTradeNoteState?.tradeNote)}
			centered
			closeOnClickOutside={!isUpdatingTrade}
			closeOnEscape={!isUpdatingTrade}
			withCloseButton={!isUpdatingTrade}
			size="xl"
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<FormControlsDisabledContainer disabled={isUpdatingTrade}>
					<Stack>
						{updateTradeError !== null &&
							updateTradeError.message.trim().length > 0 && (
								<AlertMessage type="error" mt="sm">
									{updateTradeError.message.trim()}
								</AlertMessage>
							)}
						<Textarea
							data-autofocus
							rows={8}
							key={form.key('content')}
							{...form.getInputProps('content')}
						/>
						{tagSelectorType !== null && (
							<TagSelector
								key={form.key('tagIds')}
								availableTags={selectableTags}
								tagType={tagSelectorType}
								label={`${capitalizeString(tagSelectorType.toString())} Tags`}
								onNewTagCreated={onTagCreated}
								{...form.getInputProps('tagIds')}
							/>
						)}
					</Stack>
					<Divider mt="sm" />
					<Group justify="space-between" mt="md">
						<Button variant="default" onClick={onClose} disabled={isUpdatingTrade}>
							Cancel
						</Button>
						<Button loading={isUpdatingTrade} type="submit">
							{isUpdatingTrade
								? 'Saving'
								: getTradeNoteEditorModalSaveText(editTradeNoteState?.tradeNote)}
						</Button>
					</Group>
				</FormControlsDisabledContainer>
			</form>
		</Modal>
	);
};

export default TradeNoteEditorModal;
