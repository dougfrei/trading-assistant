import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { GraphQLJSON, GraphQLTimestamp } from 'graphql-scalars';
import { join } from 'path';
import { User } from 'src/entities/User.model';
import { GQLDataloaderModule } from 'src/graphql-dataloader/GQLDataloader.module';
import { GQLDataloaderService, IDataloaders } from 'src/graphql-dataloader/GQLDataloader.service';
import { YMDDateString } from 'src/graphql-scalars/YMDDateString';
import { AVWAPGraphQLModule } from 'src/graphql/AVWAP/AVWAP.module';
import { CandlesGraphQLModule } from 'src/graphql/candles/candles.module';
import { ScreenerGraphQLModule } from 'src/graphql/screener/screener.module';
import SectorsGraphQLModule from 'src/graphql/sectors/sectors.module';
import { TickerSymbolEarningsGraphQLModule } from 'src/graphql/ticker-symbol-earnings/tickerSymbolEarnings.module';
import { TickerSymbolNewsGraphQLModule } from 'src/graphql/ticker-symbol-news/tickerSymbolNews.module';
import TickerSymbolsGraphQLModule from 'src/graphql/ticker-symbols/tickerSymbols.module';
import TradeAccountGraphQLModule from 'src/graphql/trade-account/tradeAccount.module';
import TradeInstrumentGraphQLModule from 'src/graphql/trade-instrument/tradeInstrument.module';
import TradeOptionSpreadTemplatesGraphQLModule from 'src/graphql/trade-option-spread-templates/tradeOptionSpreadTemplates.module';
import TradePerformanceGraphQLModule from 'src/graphql/trade-performance/tradePerformance.module';
import TradeTagsGraphQLModule from 'src/graphql/trade-tags/tradeTags.module';
import TradesGraphQLModule from 'src/graphql/trades/trades.module';
import UserRoleTypesGraphQLModule from 'src/graphql/user-role-types/userRoleTypes.module';
import UsersGraphQLModule from 'src/graphql/users/users.module';

export interface IGraphQLContext {
	req: Request;
	res: Response;
	loaders: IDataloaders;
	user: User | null;
}

export default [
	// https://dev.to/filipegeric/using-graphql-dataloaders-with-nestjs-2jo1
	// https://blog.logrocket.com/use-dataloader-nestjs/#setting-up-nestjs-graphql
	GraphQLModule.forRootAsync<ApolloDriverConfig>({
		driver: ApolloDriver,
		imports: [GQLDataloaderModule],
		inject: [GQLDataloaderService],
		useFactory: (dataloaderService: GQLDataloaderService) => ({
			autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
			sortSchema: true,
			resolvers: { JSON: GraphQLJSON, Timestamp: GraphQLTimestamp, YMDDateString },
			// playground: false,
			context: ({ req, res }: { req: Request; res: Response }) => ({
				user: req?.user ?? null,
				loaders: dataloaderService.getLoaders(),
				req,
				res
			}),
			formatError: (formattedError) => {
				// Handle generic "BAD_REQUEST" errors which can be caused by failed validation
				// when using the class-validator decorators on input arguments. Without this
				// handler, those failed requests will have the root error message "Bad Request".
				// This checks if there is a valid error message included in the originalError
				// object on the extensions object and will use that as the root error message instead.
				if (
					formattedError.extensions?.code === 'BAD_REQUEST' &&
					formattedError.extensions?.originalError
				) {
					const originalMessageObj = formattedError.extensions.originalError as {
						message: unknown;
						error: string;
						statusCode: number;
					};

					const originalErrorMessage = Array.isArray(originalMessageObj.message)
						? originalMessageObj.message[0]
						: originalMessageObj.message;

					if (typeof originalErrorMessage === 'string') {
						return {
							...formattedError,
							message: originalErrorMessage
						};
					}
				}

				return formattedError;
			}
		})
	}),
	SectorsGraphQLModule,
	CandlesGraphQLModule,
	ScreenerGraphQLModule,
	TickerSymbolsGraphQLModule,
	TickerSymbolEarningsGraphQLModule,
	TradesGraphQLModule,
	TradeAccountGraphQLModule,
	TradeInstrumentGraphQLModule,
	TradeTagsGraphQLModule,
	TradePerformanceGraphQLModule,
	AVWAPGraphQLModule,
	UsersGraphQLModule,
	UserRoleTypesGraphQLModule,
	TradeOptionSpreadTemplatesGraphQLModule,
	TickerSymbolNewsGraphQLModule
];
