import { Field, InputType } from '@nestjs/graphql';
import { ETradeNoteType } from '@trading-assistant/common';
import { MinLength } from 'class-validator';
import { GraphQLTimestamp } from 'graphql-scalars';
import { nanoid } from 'nanoid';
import ITradeNote from 'src/interfaces/ITradeNote';

@InputType()
export class TradeNoteInputType {
	@Field(() => String, { nullable: true, defaultValue: '' })
	id: string;

	@Field(() => GraphQLTimestamp, { nullable: true, defaultValue: 0 })
	timestamp: Date | number;

	@Field(() => ETradeNoteType)
	type: ETradeNoteType;

	@MinLength(1)
	@Field()
	content: string;

	static toObject(record: TradeNoteInputType): ITradeNote {
		let timestamp = 0;

		if (record.timestamp instanceof Date) {
			timestamp = record.timestamp.getTime();
		} else if (typeof record.timestamp === 'number') {
			timestamp = record.timestamp;
		}

		return {
			id: record.id.trim() ? record.id.trim() : nanoid(),
			timestamp: timestamp === 0 ? new Date().getTime() : timestamp,
			type: record.type,
			content: record.content
		};
	}
}
