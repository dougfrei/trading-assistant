import { IGqlTradeNote } from '@src/interfaces/IGqlResponses';
import { ETradeNoteType, ETradeTagType } from '@trading-assistant/common/enums';

export function getTradeTagTypeForNoteTagType(noteTagType: ETradeNoteType | undefined) {
	switch (noteTagType) {
		case ETradeNoteType.SETUP:
			return ETradeTagType.SETUP;

		case ETradeNoteType.REVIEW:
			return ETradeTagType.REVIEW;

		default:
			break;
	}

	return null;
}

export function getTradeNoteEditorModalTitle(tradeNote?: IGqlTradeNote) {
	let modalTitle = 'Create Trade Note';
	const noteHasId = (tradeNote?.id ?? '').trim().length > 0;

	switch (tradeNote?.type) {
		case ETradeNoteType.SETUP:
			modalTitle = noteHasId ? 'Edit Setup Notes' : 'Add Setup Notes';
			break;

		case ETradeNoteType.REVIEW:
			modalTitle = noteHasId ? 'Edit Review Notes' : 'Add Review Notes';
			break;

		default:
			modalTitle = noteHasId ? 'Edit Trade Note' : 'Add Trade Note';
			break;
	}

	return modalTitle;
}

export function getTradeNoteEditorModalSaveText(tradeNote?: IGqlTradeNote) {
	let saveText = 'Save Note';

	switch (tradeNote?.type) {
		case ETradeNoteType.SETUP:
			saveText = 'Save Setup Notes';
			break;

		case ETradeNoteType.REVIEW:
			saveText = 'Save Review Notes';
			break;

		default:
			break;
	}

	return saveText;
}
