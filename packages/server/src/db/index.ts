import { PostgresDialect } from 'kysely';
import { Pool, types } from 'pg';

// ensure that TIMESTAMP, TIMESTAMPTZ, and DATE types are returned as strings by PostgreSQL
// reference: https://github.com/brianc/node-pg-types
// types.setTypeParser(types.builtins.TIMESTAMP, (val) => val);
// types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) => val);
types.setTypeParser(types.builtins.DATE, (val) => val);
types.setTypeParser(types.builtins.NUMERIC, (val) => parseFloat(val));

export function getKyselyPostgresDialect(params: {
	database: string;
	host: string;
	user: string;
	password: string;
	port: number;
}): PostgresDialect {
	return new PostgresDialect({
		pool: new Pool({
			database: params.database,
			host: params.host,
			user: params.user,
			password: params.password,
			port: params.port,
			max: 10
		})
	});
}
