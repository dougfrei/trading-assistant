import { ActionIcon, Button, Divider, Group, Menu, Stack, Text } from '@mantine/core';
import { useTradesListContext } from '@src/hooks/useTradesListContext';
import { IGqlTrade } from '@src/interfaces/IGqlResponses';
import { IconEdit, IconPlus, IconSettings, IconTrash } from '@tabler/icons-react';
import { ETradeNoteType } from '@trading-assistant/common/enums';
import { Fragment } from 'react/jsx-runtime';

const TradesListRowNotes: React.FC<{
	trade: IGqlTrade;
}> = ({ trade }) => {
	const { setEditTradeNoteState, setDeleteTradeNoteState } = useTradesListContext();
	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
	return (
		<Stack>
			{trade.notes.map((note) => (
				<Fragment key={note.id}>
					<Group justify="space-between">
						<Text size="xs" c="dimmed">
							{note.type} - {dateFormatter.format(new Date(note.timestamp))}
						</Text>
						<Menu shadow="md" position="bottom-end" withinPortal={true} withArrow>
							<Menu.Target>
								<ActionIcon size="sm" variant="subtle" color="gray">
									<IconSettings size={14} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconEdit size={14} />}
									onClick={() => {
										// onEditNote(note.id);
										setEditTradeNoteState({
											tradeRecord: trade,
											tradeNote: note
										});
									}}
								>
									Edit
								</Menu.Item>
								<Menu.Divider />
								<Menu.Item
									color="red"
									leftSection={<IconTrash size={14} />}
									onClick={() =>
										setDeleteTradeNoteState({
											tradeRecord: trade,
											tradeNote: note
										})
									}
								>
									Delete
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
					<Stack>
						{note.content
							.split('\n')
							.filter((paragraph) => paragraph.trim())
							.map((paragraph, index) => (
								<Text key={`${paragraph.slice(0, 10)}_${index}`}>{paragraph}</Text>
							))}
					</Stack>
					<Divider />
				</Fragment>
			))}
			<Group justify="flex-end">
				<Button
					size="compact-sm"
					leftSection={<IconPlus size={14} />}
					onClick={() =>
						setEditTradeNoteState({
							tradeRecord: trade,
							tradeNote: {
								id: '',
								timestamp: 0,
								content: '',
								type: ETradeNoteType.GENERAL
							}
						})
					}
				>
					Add Note
				</Button>
			</Group>
		</Stack>
	);
};

export default TradesListRowNotes;
