import { Card, Group, Loader, Stack } from '@mantine/core';
import EditableTag from '@src/components/journal/controls/EditableTag';
import DeleteTradeTagModal from '@src/components/journal/modals/DeleteTradeTagModal';
import EditTradeTagModal from '@src/components/journal/modals/EditTradeTagModal';
import AlertMessage from '@src/components/ui/AlertMessage';
import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { createLazyFileRoute, useLoaderData } from '@tanstack/react-router';
import { ETradeTagType } from '@trading-assistant/common/enums';
import { useMemo, useState } from 'react';

const JournalTagsView: React.FC = () => {
	const tagRecords = useLoaderData({
		from: '/_app/journal/tags'
	}) as IGqlTradeTag[];
	const [tradeTags, setTradeTags] = useState(tagRecords);
	const [editTradeTagRecord, setEditTradeTagRecord] = useState<IGqlTradeTag | null>(null);
	const [deleteTradeTagRecord, setDeleteTradeTagRecord] = useState<IGqlTradeTag | null>(null);

	const setupTags = useMemo(
		() => tradeTags.filter((tag) => tag.type === ETradeTagType.SETUP),
		[tradeTags]
	);
	const reviewTags = useMemo(
		() => tradeTags.filter((tag) => tag.type === ETradeTagType.REVIEW),
		[tradeTags]
	);

	return (
		<>
			<Stack>
				<Card>
					<h3>Setup Tags</h3>
					<Group>
						{setupTags.map((tag) => (
							<EditableTag
								key={tag.id}
								tag={tag}
								onEdit={() => setEditTradeTagRecord(tag)}
								onDelete={() => setDeleteTradeTagRecord(tag)}
							/>
						))}
					</Group>
				</Card>
				<Card>
					<h3>Review Tags</h3>
					<Group>
						{reviewTags.map((tag) => (
							<EditableTag
								key={tag.id}
								tag={tag}
								onEdit={() => setEditTradeTagRecord(tag)}
								onDelete={() => setDeleteTradeTagRecord(tag)}
							/>
						))}
					</Group>
				</Card>
			</Stack>
			<EditTradeTagModal
				tradeTagRecord={editTradeTagRecord}
				onClose={() => setEditTradeTagRecord(null)}
				onUpdated={(updatedTradeTag) => {
					setTradeTags((curTags) => {
						const updateIndex = curTags.findIndex(
							(curTag) => curTag.id === updatedTradeTag.id
						);

						return updateIndex > -1
							? curTags.with(updateIndex, updatedTradeTag)
							: curTags;
					});
					setEditTradeTagRecord(null);
				}}
			/>
			<DeleteTradeTagModal
				tradeTagRecord={deleteTradeTagRecord}
				onClose={() => setDeleteTradeTagRecord(null)}
				onDeleted={(deletedTagId) => {
					setTradeTags((curTags) =>
						curTags.filter((curTag) => curTag.id !== deletedTagId)
					);
					setDeleteTradeTagRecord(null);
				}}
			/>
		</>
	);
};

export default JournalTagsView;

export const Route = createLazyFileRoute('/_app/journal/tags')({
	component: JournalTagsView,
	pendingComponent: () => <Loader />,
	errorComponent: ({ error }) => {
		return (
			<AlertMessage type="error">
				{error.message ?? 'An error occurred while loading the the trade tags'}
			</AlertMessage>
		);
	}
});
