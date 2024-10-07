import { Logger } from '@nestjs/common';
import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { tradeInstrumentsMapByName } from 'src/constants/tradeInstruments';
import { DbTradeAccountUpdate } from 'src/db/types/tables/tradeAccounts';
import { CurrentUser } from 'src/decorators/currentUser';
import { User } from 'src/entities/User.model';
import { TradeInstrument } from 'src/graphql/trade-instrument/tradeInstrument.model';
import { DbTradeAccountService } from 'src/services/db/dbTradeAccount.service';
import CreateTradeAccountArgs from './createTradeAccount.args';
import { TradeAccount } from './tradeAccount.model';
import UpdateTradeAccountArgs from './updateTradeAccount.args';

@Resolver(() => TradeAccount)
export class TradeAccountResolver {
	private readonly logger = new Logger(TradeAccountResolver.name);

	constructor(private readonly dbTradeAccountService: DbTradeAccountService) {}

	@Query(() => [TradeAccount])
	async tradeAccounts(@CurrentUser() user: User | null): Promise<TradeAccount[]> {
		if (!user) {
			this.logger.error(
				'Expected user object in tradeAccounts resolver but none was provided'
			);

			throw new GraphQLError('An error occurred while getting the trade accounts');
		}

		const records = await this.dbTradeAccountService.getTradeAccounts({
			userId: user.id,
			order: 'id asc'
		});

		return records.map((record) => TradeAccount.fromEntity(record));
	}

	@Mutation(() => TradeAccount, { name: 'createTradeAccount' })
	async createTradeAccount(
		@Args() args: CreateTradeAccountArgs,
		@CurrentUser() user: User | null
	): Promise<TradeAccount> {
		if (!user) {
			this.logger.error(
				'Expected user object in createTradeAccount resolver but none was provided'
			);

			throw new GraphQLError('An error occurred while creating the trade accounts');
		}

		const existingAccounts = await this.dbTradeAccountService.getTradeAccounts({
			userId: user.id,
			label: args.label
		});

		if (existingAccounts.length) {
			throw new GraphQLError('The specified account display label is already in use');
		}

		const createdRecord = await this.dbTradeAccountService.createTradeAccount({
			user_id: user.id,
			label: args.label,
			supported_instruments: args.supportedInstruments
		});

		if (!createdRecord) {
			throw new GraphQLError('An error occurred while creating the trading account');
		}

		return TradeAccount.fromEntity(createdRecord);
	}

	@Mutation(() => TradeAccount)
	async updateTradeAccount(
		@CurrentUser() user: User | null,
		@Args() args: UpdateTradeAccountArgs
	): Promise<TradeAccount> {
		if (!user) {
			this.logger.error(
				'Expected user object in updateTradeAccount resolver but none was provided'
			);

			throw new GraphQLError('Unable to update trade account for the current user');
		}

		const updateData: DbTradeAccountUpdate = {};

		if (typeof args.label !== 'undefined') {
			updateData.label = args.label.trim();
		}

		if (typeof args.supportedInstruments !== 'undefined') {
			updateData.supported_instruments = args.supportedInstruments;
		}

		const updatedTradeAccount = await this.dbTradeAccountService.updateTradeAccountById(
			args.id,
			user.id,
			updateData
		);

		if (!updatedTradeAccount) {
			throw new GraphQLError('unable to update trade account');
		}

		return TradeAccount.fromEntity(updatedTradeAccount);
	}

	@Mutation(() => TradeAccount, { name: 'deleteTradeAccount' })
	async deleteTradeAccount(
		@CurrentUser() user: User | null,
		@Args({ name: 'tradeAccountId', type: () => Int, nullable: false }) tradeAccountId: number
	) {
		if (!user) {
			this.logger.error(
				'Expected user object in deleteTradeAccount resolver but none was provided'
			);

			throw new GraphQLError('Unable to delete the specfied trade account');
		}

		const deletedRecord = await this.dbTradeAccountService.deleteTradeAccountById(
			tradeAccountId,
			user.id
		);

		if (!deletedRecord) {
			throw new GraphQLError('Unable to delete the specfied trade account');
		}

		return TradeAccount.fromEntity(deletedRecord);
	}

	@ResolveField('instruments', () => [TradeInstrument])
	getSupportedInstruments(@Parent() account: TradeAccount) {
		return account.supportedInstruments.reduce<TradeInstrument[]>((acum, instrumentType) => {
			const instrument = tradeInstrumentsMapByName.get(instrumentType);

			if (instrument) {
				acum.push(TradeInstrument.fromObject(instrument));
			}

			return acum;
		}, []);
	}
}
