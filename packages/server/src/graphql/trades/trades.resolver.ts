import { Logger } from '@nestjs/common';
import {
	Args,
	Context,
	Int,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver
} from '@nestjs/graphql';
import {
	ETradeNoteType,
	optionTradePositionSchema,
	stockTradePositionSchema
} from '@trading-assistant/common';
import { ETradeInstrumentType } from '@trading-assistant/common';
import { GraphQLError } from 'graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { nanoid } from 'nanoid';
import { optionSpreadTemplatesMapByName } from 'src/constants/optionSpreadTemplates';
import { tradeInstrumentsMapByName } from 'src/constants/tradeInstruments';
import { CurrentUser } from 'src/decorators/currentUser';
import { User } from 'src/entities/User.model';
import { IDataloaders } from 'src/graphql-dataloader/GQLDataloader.service';
import { TradeAccount } from 'src/graphql/trade-account/tradeAccount.model';
import { TradeInstrument } from 'src/graphql/trade-instrument/tradeInstrument.model';
import { TradeTag } from 'src/graphql/trade-tags/tradeTag.model';
import { DbTradeService, IGetTradesParams } from 'src/services/db/dbTrade.service';
import { DbTradeTagService } from 'src/services/db/dbTradeTag.service';
import {
	ICreateNewTradeParams,
	TUpdateTradeParams,
	TradesService
} from 'src/services/trades.service';
import {
	DEFAULT_ADD_TRADE_REVIEW_ERROR_MESSAGE,
	DEFAULT_DELETE_TRADE_ERROR_MESSAGE,
	DEFAULT_UPDATE_TRADE_ERROR_MESSAGE
} from 'src/util/constants';
import { calculateClosingPosition, isTradeAllSettled } from 'src/util/trade-positions';
import * as v from 'valibot';
import { TickerSymbol } from '../ticker-symbols/ticker.model';
import { TradeOptionSpreadTemplate } from '../trade-option-spread-templates/tradeOptionSpreadTemplate.model';
import AddTradeReviewArgs from './addTradeReview.args';
import CreateTradeArgs from './createTrade.args';
import PaginatedTradesArgs from './paginatedTrades.args';
import { PaginatedTradesResponse } from './paginatedTradesResponse.model';
import { Trade } from './trade.model';
import { TradeNoteInputType } from './tradeNote.input';
import { TradePriceLevelInputType } from './tradePriceLevel.input';
import UpdateTradeArgs from './updateTrade.args';

@Resolver(() => Trade)
export class TradesResolver {
	private readonly logger = new Logger(TradesResolver.name);

	constructor(
		private readonly dbTradeService: DbTradeService,
		private readonly dbTradeTagService: DbTradeTagService,
		private readonly tradesService: TradesService
	) {}

	@Query(() => PaginatedTradesResponse)
	async paginatedTrades(
		@CurrentUser() user: User | null,
		@Args() args: PaginatedTradesArgs
	): Promise<PaginatedTradesResponse> {
		if (!user) {
			this.logger.error(
				'Expected user object in paginatedTrades resolver but none was provided'
			);

			throw new GraphQLError('Unable to get trades for the current user');
		}

		const whereArgs: IGetTradesParams = {};

		if (args.accountId) {
			whereArgs.accountId = args.accountId;
		}

		if (typeof args.instrumentType !== 'undefined') {
			whereArgs.instrumentType = args.instrumentType;
		}

		if (args.tickerSymbol.trim()) {
			whereArgs.tickerSymbol = args.tickerSymbol.toUpperCase().trim();
		}

		if (args.optionSpreadTemplate) {
			whereArgs.optionSpreadTemplate = args.optionSpreadTemplate;
		}

		if (typeof args.isClosed === 'boolean') {
			whereArgs.isClosed = true;
		}

		const totalCount = await this.dbTradeService.getTradesCount(whereArgs);

		const trades = await this.dbTradeService.getTrades({
			...whereArgs,
			userId: user.id,
			limit: args.perPage,
			offset: (args.page - 1) * args.perPage,
			useOpenFirstOrdering: true
		});

		return {
			pagination: {
				currentPage: args.page,
				totalPages: Math.ceil(totalCount / args.perPage),
				perPage: args.perPage,
				totalRecords: totalCount
			},
			records: trades.map((trade) => Trade.fromEntity(trade))
		};
	}

	@Query(() => GraphQLJSON)
	async calculateTradeClosePosition(
		@CurrentUser() user: User | null,
		@Args({ name: 'tradeId', type: () => Int, nullable: false }) tradeId: number
	) {
		if (!user) {
			this.logger.error(
				'Expected user object in calculateTradeClosePosition resolver but none was provided'
			);

			throw new GraphQLError('You must be logged-in to calculate trade closing positions.');
		}

		const tradeRecord = await this.dbTradeService.getTradeById(tradeId, user.id);

		if (!tradeRecord) {
			throw new GraphQLError('An error occurred while calculating the trade close position');
		}

		if (isTradeAllSettled(tradeRecord.instrumentType, tradeRecord.positions)) {
			throw new GraphQLError('The specified trade has already been closed');
		}

		const closingPosition = calculateClosingPosition(
			tradeRecord.instrumentType,
			tradeRecord.positions
		);

		if (!closingPosition) {
			throw new GraphQLError('An error occurred while calculating the trade close position');
		}

		return closingPosition;
	}

	@Mutation(() => Trade)
	async createTrade(
		@CurrentUser() user: User | null,
		@Args() args: CreateTradeArgs
	): Promise<Trade> {
		if (!user) {
			this.logger.error('Expected user object in createTrade resolver but none was provided');

			throw new GraphQLError('You must be logged-in to create trade records.');
		}

		const createArgs: ICreateNewTradeParams = {
			userId: user.id,
			accountId: args.accountId,
			instrumentType: args.instrumentType,
			tickerSymbol: args.tickerSymbol,
			positions: [],
			optionSpreadTemplate: args?.optionSpreadTemplate ?? '',
			stopLossLevels:
				args?.stopLossLevels?.map((priceLevel) =>
					TradePriceLevelInputType.toObject(priceLevel)
				) ?? [],
			profitTargetLevels:
				args?.profitTargetLevels?.map((priceLevel) =>
					TradePriceLevelInputType.toObject(priceLevel)
				) ?? [],
			tagIds: args.tagIds
			// notes: args?.notes?.map((note) => TradeNoteInputType.toObject(note))
		};

		if (args.notes.trim()) {
			createArgs.notes = args.notes.trim();
		}

		switch (args.instrumentType) {
			case ETradeInstrumentType.STOCK: {
				const validatedPositions = args.positions.map((position) => {
					const validationResult = v.safeParse(stockTradePositionSchema, position);

					if (!validationResult.success) {
						throw new GraphQLError(
							'An error occurred while validating the initial stock position.'
						);
					}

					return validationResult.output;
				});

				createArgs.positions = validatedPositions;
				// TODO: check if initial position total debit/credit or quantity is zero
				break;
			}

			case ETradeInstrumentType.OPTION: {
				const validatedPositions = args.positions.map((position) => {
					const validationResult = v.safeParse(optionTradePositionSchema, position);

					if (!validationResult.success) {
						throw new GraphQLError(
							'An error occurred while validating the initial option position.'
						);
					}

					return validationResult.output;
				});

				// TODO: validate initial position option legs with 'compareWithPreviousLeg' logic if an optionType is specified
				// TODO: move the comparision logic to the common package so the frontend can also use it

				createArgs.positions = validatedPositions;

				break;
			}

			default:
				break;
		}

		const savedTrade = await this.tradesService.createNewTrade(createArgs);

		if (!savedTrade) {
			throw new GraphQLError('An error occurred while creating the new trade record.');
		}

		return Trade.fromEntity(savedTrade);
	}

	@Mutation(() => Trade)
	async updateTrade(
		@CurrentUser() user: User | null,
		@Args() args: UpdateTradeArgs
	): Promise<Trade> {
		if (!user) {
			this.logger.error('Expected user object in updateTrade resolver but none was provided');

			throw new GraphQLError(DEFAULT_UPDATE_TRADE_ERROR_MESSAGE);
		}

		const updateData: TUpdateTradeParams = {
			userId: user.id
		};

		if (typeof args.accountId !== 'undefined') {
			updateData.accountId = args.accountId;
		}

		if (typeof args.instrumentType !== 'undefined') {
			updateData.instrumentType = args.instrumentType;
		}

		if (typeof args.tickerSymbol !== 'undefined') {
			updateData.tickerSymbol = args.tickerSymbol;
		}

		if (typeof args.optionSpreadTemplate !== 'undefined') {
			updateData.optionSpreadTemplate = args.optionSpreadTemplate;
		}

		if (typeof args.stopLossLevels !== 'undefined') {
			updateData.stopLossLevels = args.stopLossLevels.map((level) =>
				TradePriceLevelInputType.toObject(level)
			);
		}

		if (typeof args.profitTargetLevels !== 'undefined') {
			updateData.profitTargetLevels = args.profitTargetLevels.map((level) =>
				TradePriceLevelInputType.toObject(level)
			);
		}

		if (typeof args.positions !== 'undefined') {
			updateData.positions = args.positions;
		}

		if (typeof args.tagIds !== 'undefined') {
			updateData.tagIds = args.tagIds;
		}

		if (typeof args.notes !== 'undefined') {
			updateData.notes = args.notes.map((note) => TradeNoteInputType.toObject(note));
		}

		const updatedTrade = await this.tradesService.updateTrade(args.id, user.id, updateData);

		if (!updatedTrade) {
			throw new GraphQLError(DEFAULT_UPDATE_TRADE_ERROR_MESSAGE);
		}

		return Trade.fromEntity(updatedTrade);
	}

	@Mutation(() => Trade)
	async deleteTrade(
		@CurrentUser() user: User | null,
		@Args({ name: 'tradeId', type: () => Int, nullable: false }) tradeId: number
	) {
		if (!user) {
			this.logger.error('Expected user object in deleteTrade resolver but none was provided');

			throw new GraphQLError(DEFAULT_DELETE_TRADE_ERROR_MESSAGE);
		}

		const deletedRecord = await this.dbTradeService.deleteTradeById(tradeId, user.id);

		if (!deletedRecord) {
			throw new GraphQLError(DEFAULT_DELETE_TRADE_ERROR_MESSAGE);
		}

		return Trade.fromEntity(deletedRecord);
	}

	@Mutation(() => Trade)
	async addTradeReview(@CurrentUser() user: User | null, @Args() args: AddTradeReviewArgs) {
		if (!user) {
			this.logger.error(
				'Expected user object in addTradeReview resolver but none was provided'
			);

			throw new GraphQLError(DEFAULT_ADD_TRADE_REVIEW_ERROR_MESSAGE);
		}

		const existingRecord = await this.dbTradeService.getTradeById(args.id, user.id);

		if (!existingRecord) {
			throw new GraphQLError(DEFAULT_ADD_TRADE_REVIEW_ERROR_MESSAGE);
		}

		const existingReview = existingRecord.notes.find(
			(note) => note.type === ETradeNoteType.REVIEW
		);

		if (existingReview) {
			throw new GraphQLError('This trade has already been reviewed');
		}

		const newNotes = [...existingRecord.notes];
		newNotes.push({
			id: nanoid(),
			timestamp: new Date().getTime(),
			type: ETradeNoteType.REVIEW,
			content: args.reviewContent
		});

		const updatedTrade = await this.dbTradeService.updateTradeById(existingRecord.id, user.id, {
			notes: JSON.stringify(newNotes)
		});

		if (!updatedTrade) {
			throw new GraphQLError(DEFAULT_ADD_TRADE_REVIEW_ERROR_MESSAGE);
		}

		// update the trade tag relations if args.tagIds is set
		if (Array.isArray(args.tagIds) && args.tagIds.length) {
			const tagIdsByTradeId = await this.dbTradeTagService.getTradeTagsForTradeIds([
				updatedTrade.id
			]);
			const currentTagIds = (tagIdsByTradeId.get(updatedTrade.id) ?? []).map(
				(tradeTag) => tradeTag.id
			);

			await this.dbTradeTagService.setTagIdsForTradeId(updatedTrade.id, [
				...currentTagIds,
				...args.tagIds
			]);
		}

		return Trade.fromEntity(updatedTrade);
	}

	@ResolveField('account', () => TradeAccount)
	getTradeAccount(@Parent() trade: Trade, @Context() { loaders }: { loaders: IDataloaders }) {
		return loaders.tradeAccountsLoader.load(trade.accountId);
	}

	@ResolveField('instrument', () => TradeInstrument, { nullable: true })
	getTradeInstrument(@Parent() trade: Trade) {
		const instrument = tradeInstrumentsMapByName.get(trade.instrumentType);

		return instrument ? TradeInstrument.fromObject(instrument) : null;
	}

	@ResolveField('optionType', () => TradeOptionSpreadTemplate, {
		nullable: true
	})
	getTradeOptionType(@Parent() trade: Trade) {
		return trade.optionSpreadTemplate
			? (optionSpreadTemplatesMapByName.get(trade.optionSpreadTemplate) ?? null)
			: null;
	}

	@ResolveField('tags', () => [TradeTag], {
		nullable: true
	})
	getTradeTags(@Parent() trade: Trade, @Context() { loaders }: { loaders: IDataloaders }) {
		return loaders.tradeTagsLoader.load(trade.id);
	}

	@ResolveField('tickerSymbolRecord', () => TickerSymbol, { nullable: true })
	getTickerSymbolRecord(
		@Parent() trade: Trade,
		@Context() { loaders }: { loaders: IDataloaders }
	) {
		return loaders.tradeTickerSymbolsLoader.load(trade.tickerSymbol);
	}
}
