import { ETradeNoteType } from '@trading-assistant/common';
import { nanoid } from 'nanoid';
import * as v from 'valibot';

interface ITradeNote {
	id: string;
	timestamp: number;
	type: ETradeNoteType;
	content: string;
}

export const tradeNoteSchema = v.object({
	id: v.optional(v.string(), nanoid()),
	timestamp: v.optional(v.number(), new Date().getTime()),
	type: v.enum(ETradeNoteType),
	content: v.string()
});

export default ITradeNote;
