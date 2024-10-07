import { Fieldset, Stack, Textarea } from '@mantine/core';
import TagSelector from '@src/components/journal/controls/TagSelector';
import { IGqlTradeTag } from '@src/interfaces/IGqlResponses';
import { ETradeTagType } from '@trading-assistant/common/enums';
import { useCreateTradeFormContext } from '../CreateTradeForm.context';

const TagsAndNotes: React.FC<{
	setupTags: IGqlTradeTag[];
	onNewTagCreated: (record: IGqlTradeTag) => void;
}> = ({ setupTags, onNewTagCreated }) => {
	const form = useCreateTradeFormContext();

	return (
		<Fieldset legend="Tags & Notes">
			<Stack>
				<TagSelector
					key={form.key('setupTagIds')}
					availableTags={setupTags}
					tagType={ETradeTagType.SETUP}
					label="Setup Tags"
					onNewTagCreated={onNewTagCreated}
					{...form.getInputProps('setupTagIds')}
				/>
				<Textarea
					key={form.key('notes')}
					label="Initial Notes"
					rows={5}
					{...form.getInputProps('notes')}
				/>
			</Stack>
		</Fieldset>
	);
};

export default TagsAndNotes;
