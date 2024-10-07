import { MultiSelectCreatable } from '@src/components/controls/MultiSelectCreatable';
import AlertMessage from '@src/components/ui/AlertMessage';
import useCreateTradeTag from '@src/hooks/useCreateTradeTag';
import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { ETradeTagType } from '@trading-assistant/common/enums';
import { useMemo } from 'react';

const TagSelector: React.FC<{
	availableTags: IGqlTradeTag[];
	tagType: ETradeTagType;
	value?: number[];
	readOnly?: boolean;
	label?: string;
	onChange: (values: number[]) => void;
	onNewTagCreated: (record: IGqlTradeTag) => void;
}> = ({
	availableTags,
	tagType,
	value: selectedIds = [],
	readOnly = false,
	label = 'Tag(s)',
	onChange,
	onNewTagCreated
}) => {
	const multiSelectData = useMemo<string[]>(
		() => availableTags.map((tag) => tag.label),
		[availableTags]
	);
	const multiSelectValues = useMemo<string[]>(
		() => availableTags.filter((tag) => selectedIds.includes(tag.id)).map((tag) => tag.label),
		[selectedIds, availableTags]
	);

	const { createTradeTag, createTradeTagError, isCreatingTradeTag } = useCreateTradeTag(
		(newTradeTag) => {
			onNewTagCreated(newTradeTag);
			onChange([...selectedIds, newTradeTag.id]);
		}
	);

	return (
		<>
			<MultiSelectCreatable
				data={multiSelectData}
				values={multiSelectValues}
				isLoading={isCreatingTradeTag}
				disabled={readOnly || isCreatingTradeTag}
				label={label}
				onAddNewValue={async (value) => createTradeTag({ type: tagType, label: value })}
				onAddValue={(value) => {
					const tagRecord = availableTags.find((tag) => tag.label === value);

					if (tagRecord) {
						onChange([...selectedIds, tagRecord.id]);
					}
				}}
				onRemoveValue={(value) => {
					const tagRecord = availableTags.find((tag) => tag.label === value);

					if (tagRecord) {
						onChange(selectedIds.filter((id) => id !== tagRecord.id));
					}
				}}
			/>
			{createTradeTagError !== null && (
				<AlertMessage type="error" mt="sm">
					{createTradeTagError.message}
				</AlertMessage>
			)}
		</>
	);
};

export default TagSelector;
