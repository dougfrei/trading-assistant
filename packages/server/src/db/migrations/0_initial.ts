import {
	ETickerSymbolType,
	ETradeInstrumentType,
	ETradeTagType,
	passwordSchema
} from '@trading-assistant/common';
import { Kysely, sql } from 'kysely';
import { read } from 'read';
import EUserRoleType from 'src/enums/EUserRoleType';
import { hashPassword } from 'src/util/passwords';
import * as v from 'valibot';
import { ITables } from '../types';

async function getInitialAuthValues() {
	let initialUsername = '';
	let initialPassword = '';
	let initialDisplayName = '';

	while (initialUsername === '') {
		const input = await read({
			prompt: 'Please enter the default user email (ex: "admin@default.com"): '
		});

		const validateResult = v.safeParse(v.pipe(v.string(), v.email()), input);

		if (validateResult.success) {
			initialUsername = validateResult.output.trim();
		} else {
			console.log('Please enter a valid email address');
		}
	}

	while (initialPassword === '') {
		const input = await read({
			prompt: 'Please enter the default user password: ',
			silent: true,
			replace: '*'
		});

		const validateResult = v.safeParse(passwordSchema(), input);

		if (validateResult.success) {
			initialPassword = validateResult.output.trim();
		} else {
			console.log('Your password must not be empty');
		}
	}

	while (initialDisplayName === '') {
		const input = await read({
			prompt: 'How shall your name be displayed (ex: "Default User"): '
		});

		const validateResult = v.safeParse(v.pipe(v.string(), v.trim(), v.minLength(1)), input);

		if (validateResult.success) {
			initialDisplayName = validateResult.output.trim();
		} else {
			console.log('This value cannot be empty');
		}
	}

	return [initialUsername, initialPassword, initialDisplayName];
}

export async function up(db: Kysely<ITables>): Promise<void> {
	/**
	 * users
	 */
	await db.schema
		.createTable('users')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('username', 'varchar(254)', (col) => col.unique().notNull())
		.addColumn('password', 'text', (col) => col.defaultTo('').notNull())
		.addColumn('display_name', 'text', (col) => col.defaultTo(''))
		.addColumn('refresh_tokens', 'jsonb', (col) => col.defaultTo('[]'))
		.addColumn('roles', 'jsonb', (col) => col.defaultTo('[]'))
		.addColumn('active', 'boolean', (col) => col.defaultTo(false))
		.addColumn('activate_id', 'text', (col) => col.defaultTo(sql`gen_random_uuid()`)) // NOTE: not using a "uuid" field type here since it will not allow an empty value
		.addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
		.execute();

	/**
	 * ticker_symbols
	 */
	await db.schema
		.createType('t_ticker_symbol_type')
		.asEnum([ETickerSymbolType.stock, ETickerSymbolType.ETF])
		.execute();

	await db.schema
		.createTable('ticker_symbols')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('name', 'varchar(10)', (col) => col.notNull().unique())
		.addColumn('label', 'varchar(255)')
		.addColumn('avg_daily_vol', 'integer', (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`avg_daily_vol >= 0`)
		)
		.addColumn('market_cap', 'bigint', (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`market_cap >= 0`)
		)
		.addColumn('last_price', sql`NUMERIC(10,2)`, (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`last_price >= 0`)
		)
		.addColumn('all_time_high', sql`NUMERIC(10,2)`, (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`all_time_high >= 0`)
		)
		.addColumn('all_time_low', sql`NUMERIC(10,2)`, (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`all_time_low >= 0`)
		)
		.addColumn('ttm_high', sql`NUMERIC(10,2)`, (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`ttm_high >= 0`)
		)
		.addColumn('ttm_low', sql`NUMERIC(10,2)`, (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`ttm_low >= 0`)
		)
		.addColumn('active', 'boolean', (col) => col.defaultTo(true))
		.addColumn('gcis', 'varchar(8)', (col) => col.defaultTo(''))
		.addColumn('type', sql`t_ticker_symbol_type`)
		.addColumn('truncated_values', 'jsonb', (col) => col.defaultTo('{}'))
		.execute();

	// create index for 'gcis' field
	await db.schema.createIndex('gcis_index').on('ticker_symbols').column('gcis').execute();

	/**
	 * ticker_symbol_earnings
	 */
	await db.schema
		.createTable('ticker_symbol_earnings')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('ticker_symbol_id', 'integer', (col) =>
			col.references('ticker_symbols.id').onDelete('cascade')
		)
		.addColumn('date', 'date', (col) => col.notNull())
		.addColumn('after_close', 'boolean', (col) => col.defaultTo(false))
		.addColumn('eps', sql`NUMERIC(10,2)`)
		.addColumn('eps_estimated', sql`NUMERIC(10,2)`)
		.addColumn('revenue', 'bigint')
		.addColumn('revenue_estimated', 'bigint')
		.addColumn('fiscal_date_ending', 'date')
		.execute();

	// create index for 'ticker_symbol_id' field
	await db.schema
		.createIndex('ticker_symbol_id_index_earnings')
		.on('ticker_symbol_earnings')
		.column('ticker_symbol_id')
		.execute();

	// create index for 'date' field
	await db.schema
		.createIndex('date_index_earnings')
		.on('ticker_symbol_earnings')
		.column('date')
		.execute();

	// create unique index for 'ticker_symbol_id' + 'date' field combination
	await db.schema
		.createIndex('unique_ticker_and_date_earnings')
		.on('ticker_symbol_earnings')
		.columns(['ticker_symbol_id', 'date'])
		.unique()
		.execute();

	/**
	 * ticker_symbol_splits
	 */
	await db.schema
		.createTable('ticker_symbol_splits')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('ticker_symbol_id', 'integer', (col) =>
			col.references('ticker_symbols.id').onDelete('cascade')
		)
		.addColumn('date', 'date', (col) => col.notNull())
		.addColumn('from_value', 'integer', (col) => col.notNull().check(sql`from_value > 0`))
		.addColumn('to_value', 'integer', (col) => col.notNull().check(sql`to_value > 0`))
		.addColumn('candles_updated', 'boolean', (col) => col.defaultTo(false))
		.execute();

	// create unique index for 'ticker_symbol_id' + 'date' field combination
	await db.schema
		.createIndex('unique_ticker_and_date_splits')
		.on('ticker_symbol_splits')
		.columns(['ticker_symbol_id', 'date'])
		.unique()
		.execute();

	/**
	 * candles
	 */
	await db.schema
		.createType('t_period_type')
		.asEnum(['M1', 'M5', 'M15', 'M30', 'H', 'D', 'W', 'M', 'Y'])
		.execute();

	await db.schema
		.createTable('candles')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('ticker_symbol_id', 'integer', (col) =>
			col.references('ticker_symbols.id').onDelete('cascade')
		)
		.addColumn('open', sql`NUMERIC(10,2)`, (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`open >= 0`)
		)
		.addColumn('high', sql`NUMERIC(10,2)`, (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`high >= 0`)
		)
		.addColumn('low', sql`NUMERIC(10,2)`, (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`low >= 0`)
		)
		.addColumn('close', sql`NUMERIC(10,2)`, (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`close >= 0`)
		)
		.addColumn('volume', 'integer', (col) =>
			col
				.notNull()
				.defaultTo(0)
				.check(sql`volume >= 0`)
		)
		.addColumn('period', 'timestamp', (col) => col.notNull())
		.addColumn('period_type', sql`t_period_type`, (col) => col.notNull())
		.addColumn('indicators', 'jsonb', (col) => col.defaultTo('{}'))
		.addColumn('alerts', 'jsonb', (col) => col.defaultTo('[]'))
		.addColumn('truncated_values', 'jsonb', (col) => col.defaultTo('{}'))
		.execute();

	// create index for 'ticker_symbol_id' field
	await db.schema
		.createIndex('ticker_symbol_id_index_candles')
		.on('candles')
		.column('ticker_symbol_id')
		.execute();

	// create index for 'period' field
	await db.schema.createIndex('period_index').on('candles').column('period').execute();

	// create index for 'period_type' field
	await db.schema.createIndex('period_type_index').on('candles').column('period_type').execute();

	// create unique index for 'ticker_symbol_id' + 'period' + 'period_type' field combination
	await db.schema
		.createIndex('unique__ticker_symbol__period__period_type')
		.on('candles')
		.columns(['ticker_symbol_id', 'period', 'period_type'])
		.unique()
		.execute();

	/**
	 * screener_queries
	 */
	await db.schema
		.createTable('screener_queries')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('label', 'varchar(255)', (col) => col.notNull())
		.addColumn('description', 'text')
		.addColumn('query', 'jsonb', (col) => col.notNull().defaultTo('{}'))
		.execute();

	/**
	 * trade_accounts
	 */
	await db.schema
		.createTable('trade_accounts')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade'))
		.addColumn('label', 'varchar(255)')
		.addColumn('supported_instruments', sql`text[]`)
		.execute();

	await db.schema
		.createIndex('trade_account_user_id_index')
		.on('trade_accounts')
		.column('user_id')
		.execute();

	/**
	 * trade_tags
	 */
	await db.schema
		.createType('t_tag_type')
		.asEnum([ETradeTagType.SETUP, ETradeTagType.REVIEW])
		.execute();

	await db.schema
		.createTable('trade_tags')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade'))
		.addColumn('type', sql`t_tag_type`)
		.addColumn('label', 'varchar(255)', (col) => col.notNull().unique())
		.execute();

	await db.schema
		.createIndex('trade_tag_user_id_index')
		.on('trade_tags')
		.column('user_id')
		.execute();

	/**
	 * trades
	 */
	await db.schema
		.createType('t_trade_instrument_type')
		.asEnum([
			ETradeInstrumentType.STOCK,
			ETradeInstrumentType.OPTION,
			ETradeInstrumentType.FUTURES,
			ETradeInstrumentType.CRYPTO
		])
		.execute();

	await db.schema
		.createTable('trades')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade'))
		.addColumn('account_id', 'integer', (col) =>
			col.references('trade_accounts.id').onDelete('cascade')
		)
		.addColumn('instrument_type', sql`t_trade_instrument_type`, (col) => col.notNull())
		.addColumn('ticker_symbol', 'varchar(10)', (col) => col.notNull())
		.addColumn('option_spread_template', 'varchar(40)')
		.addColumn('positions', 'jsonb', (col) => col.notNull().defaultTo('[]'))
		.addColumn('stop_loss_levels', 'jsonb', (col) => col.notNull().defaultTo('[]'))
		.addColumn('profit_target_levels', 'jsonb', (col) => col.notNull().defaultTo('[]'))
		.addColumn('notes', 'jsonb', (col) => col.notNull().defaultTo('[]'))
		.addColumn('open_date_time', 'timestamp')
		.addColumn('close_date_time', 'timestamp')
		.execute();

	await db.schema.createIndex('trade_user_id_index').on('trades').column('user_id').execute();

	await db.schema
		.createIndex('trade_instrument_type_index')
		.on('trades')
		.column('instrument_type')
		.execute();

	await db.schema
		.createIndex('trade_option_spread_template_index')
		.on('trades')
		.column('option_spread_template')
		.execute();

	/**
	 * ticker_symbol_avwap
	 */
	await db.schema
		.createType('t_avwap_type')
		.asEnum([
			'EARNINGS',
			'TRIPLE_WITCHING',
			'HIGH_VOLUME',
			'RELATIVE_HIGH',
			'RELATIVE_LOW',
			'OTHER'
		])
		.execute();

	await db.schema
		.createTable('ticker_symbol_avwap')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('ticker_symbol_id', 'integer', (col) =>
			col.references('ticker_symbols.id').onDelete('cascade')
		)
		.addColumn('start_candle_id', 'integer', (col) =>
			col.references('candles.id').onDelete('cascade')
		)
		.addColumn('type', sql`t_avwap_type`)
		.execute();

	/**
	 * nyse_market_holidays
	 */
	await db.schema
		.createTable('nyse_market_holidays')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('date', 'date', (col) => col.notNull().unique())
		.addColumn('is_early_close', 'boolean', (col) => col.defaultTo(false))
		.execute();

	/**
	 * _relation_trades_to_trade_tags
	 */
	await db.schema
		.createTable('_relation_trades_to_trade_tags')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('trade_id', 'integer', (col) => col.references('trades.id').onDelete('cascade'))
		.addColumn('trade_tag_id', 'integer', (col) =>
			col.references('trade_tags.id').onDelete('cascade')
		)
		.execute();

	await db.schema
		.createIndex('unique__trade_id__trade_tag_id')
		.on('_relation_trades_to_trade_tags')
		.columns(['trade_id', 'trade_tag_id'])
		.unique()
		.execute();

	/**
	 * TASK: Seed initial records
	 */
	// create default user
	const [username, password, displayName] = await getInitialAuthValues();

	const hashedPassword = await hashPassword(password);

	await db
		.insertInto('users')
		.values({
			username: username,
			password: hashedPassword,
			display_name: displayName,
			roles: JSON.stringify([EUserRoleType.ADMIN]),
			refresh_tokens: JSON.stringify([]),
			activate_id: '',
			active: true
		})
		.executeTakeFirstOrThrow();
}

export async function down(db: Kysely<ITables>): Promise<void> {
	await db.schema.dropTable('users').ifExists().cascade().execute();
	await db.schema.dropTable('ticker_symbols').ifExists().cascade().execute();
	await db.schema.dropTable('ticker_symbol_earnings').ifExists().cascade().execute();
	await db.schema.dropTable('ticker_symbol_splits').ifExists().cascade().execute();
	await db.schema.dropTable('candles').ifExists().cascade().execute();
	await db.schema.dropTable('screener_queries').ifExists().cascade().execute();
	await db.schema.dropTable('trades').ifExists().cascade().execute();
	await db.schema.dropTable('trade_accounts').ifExists().cascade().execute();
	await db.schema.dropTable('trade_tags').ifExists().cascade().execute();
	await db.schema.dropTable('ticker_symbol_avwap').ifExists().cascade().execute();
	await db.schema.dropTable('nyse_market_holidays').ifExists().cascade().execute();
	await db.schema.dropTable('_relation_trades_to_trade_tags').ifExists().cascade().execute();

	await db.schema.dropType('t_ticker_symbol_type').ifExists().execute();
	await db.schema.dropType('t_period_type').ifExists().execute();
	await db.schema.dropType('t_option_type').ifExists().execute();
	await db.schema.dropType('t_trade_side').ifExists().execute();
	await db.schema.dropType('t_tag_type').ifExists().execute();
	await db.schema.dropType('t_avwap_type').ifExists().execute();
	await db.schema.dropType('t_trade_instrument_type').ifExists().execute();
}
