import { Logger } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ETradeTagType, sanitizeStringValue } from '@trading-assistant/common';
import { GraphQLError } from 'graphql';
import { DbTradeTagUpdate } from 'src/db/types/tables/tradeTags';
import { CurrentUser } from 'src/decorators/currentUser';
import { User } from 'src/entities/User.model';
import { DbTradeTagService, IGetTradeTagsParams } from 'src/services/db/dbTradeTag.service';
import {
	DEFAULT_DELETE_TRADE_TAG_ERROR_MESSAGE,
	DEFAULT_UPDATE_TRADE_TAG_ERROR_MESSAGE
} from 'src/util/constants';
import CreateTradeTagArgs from './createTradeTag.args';
import { TradeTag } from './tradeTag.model';
import UpdateTradeTagArgs from './updateTradeTag.args';

@Resolver(() => TradeTag)
export class TradeTagsResolver {
	private readonly logger = new Logger(TradeTagsResolver.name);

	constructor(private readonly dbTradeTagService: DbTradeTagService) {}

	@Query(() => [TradeTag], { name: 'tradeTags' })
	async getTradeTags(
		@CurrentUser() user: User | null,
		@Args({ name: 'type', type: () => ETradeTagType, nullable: true }) type: ETradeTagType
	): Promise<TradeTag[]> {
		// throw new GraphQLError('test error');

		if (!user) {
			this.logger.error('Expected user object in getTradeTag resolver but none was provided');

			throw new GraphQLError('An error occurred while getting the trade tags');
		}

		const queryParams: IGetTradeTagsParams = {
			userId: user.id
		};

		if (type) {
			queryParams.type = type;
		}

		const tagRecords = await this.dbTradeTagService.getTradeTags(queryParams);

		return tagRecords.map((setup) => TradeTag.fromEntity(setup));
	}

	@Mutation(() => TradeTag)
	async createTradeTag(
		@CurrentUser() user: User | null,
		@Args() args: CreateTradeTagArgs
	): Promise<TradeTag> {
		if (!user) {
			this.logger.error(
				'Expected user object in createTradeTag resolver but none was provided'
			);

			throw new GraphQLError(
				`An error occurred while creating the trade tag "${args.label}"`
			);
		}

		const allTypeRecords = await this.dbTradeTagService.getTradeTags({ type: args.type });

		const sanitizedNewLabel = sanitizeStringValue(args.label);

		const existingIndex = allTypeRecords.findIndex((record) => {
			const sanitizedCurLabel = sanitizeStringValue(record.label);

			return sanitizedCurLabel === sanitizedNewLabel;
		});

		if (existingIndex !== -1) {
			throw new GraphQLError(`Cannot create duplicate tag "${args.label}"`);
		}

		const newRecord = await this.dbTradeTagService.createTradeTag({
			user_id: user.id,
			label: args.label,
			type: args.type
		});

		if (!newRecord) {
			throw new GraphQLError(
				`An error occurred while creating the trade tag "${args.label}"`
			);
		}

		return TradeTag.fromEntity(newRecord);
	}

	@Mutation(() => TradeTag)
	async updateTradeTag(@CurrentUser() user: User | null, @Args() args: UpdateTradeTagArgs) {
		if (!user) {
			this.logger.error(
				'Expected user object in updateTradeTag resolver but none was provided'
			);

			throw new GraphQLError(DEFAULT_UPDATE_TRADE_TAG_ERROR_MESSAGE);
		}

		const updateData: DbTradeTagUpdate = {};

		if (typeof args.label !== 'undefined') {
			updateData.label = args.label;
		}

		if (typeof args.type !== 'undefined') {
			updateData.type = args.type;
		}

		const updatedTag = await this.dbTradeTagService.updateTradeTagById(
			args.id,
			user.id,
			updateData
		);

		if (!updatedTag) {
			throw new GraphQLError(DEFAULT_UPDATE_TRADE_TAG_ERROR_MESSAGE);
		}

		return TradeTag.fromEntity(updatedTag);
	}

	@Mutation(() => TradeTag)
	async deleteTradeTag(
		@CurrentUser() user: User | null,
		@Args({ name: 'tagId', type: () => Int, nullable: false }) tagId: number
	) {
		if (!user) {
			this.logger.error(
				'Expected user object in deleteTradeTag resolver but none was provided'
			);

			throw new GraphQLError(DEFAULT_DELETE_TRADE_TAG_ERROR_MESSAGE);
		}

		const deletedRecord = await this.dbTradeTagService.deleteTradeTagById(tagId, user.id);

		if (!deletedRecord) {
			throw new GraphQLError(DEFAULT_DELETE_TRADE_TAG_ERROR_MESSAGE);
		}

		return TradeTag.fromEntity(deletedRecord);
	}
}
