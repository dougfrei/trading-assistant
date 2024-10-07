import { ActionIcon, Badge, Menu } from '@mantine/core';
import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { IconEdit, IconMenu2, IconTrash } from '@tabler/icons-react';

const EditableTag: React.FC<{
	tag: IGqlTradeTag;
	onEdit: () => void;
	onDelete: () => void;
}> = ({ tag, onEdit, onDelete }) => {
	return (
		<Badge
			key={tag.id}
			size="lg"
			rightSection={
				<Menu withArrow>
					<Menu.Target>
						<ActionIcon variant="transparent">
							<IconMenu2 size={16} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item leftSection={<IconEdit size={16} />} onClick={onEdit}>
							Edit
						</Menu.Item>
						<Menu.Item
							color="red"
							leftSection={<IconTrash size={16} />}
							onClick={onDelete}
						>
							Delete
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			}
		>
			{tag.label}
		</Badge>
	);
};

export default EditableTag;
