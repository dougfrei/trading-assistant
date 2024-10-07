import { Global, Module } from '@nestjs/common';
import { Kysely } from 'kysely';
import { ConfigurableDatabaseModule, DATABASE_OPTIONS } from 'src/db/db.module-definition';
import { IDatabaseOptions, ITables } from 'src/db/types';
import { getKyselyPostgresDialect } from '.';

export class Database extends Kysely<ITables> {}

@Global()
@Module({
	exports: [Database],
	providers: [
		{
			provide: Database,
			inject: [DATABASE_OPTIONS],
			useFactory: (databaseOptions: IDatabaseOptions) => {
				return new Database({
					dialect: getKyselyPostgresDialect({
						host: databaseOptions.host,
						port: databaseOptions.port,
						user: databaseOptions.user,
						password: databaseOptions.password,
						database: databaseOptions.database
					})
				});
			}
		}
	]
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
