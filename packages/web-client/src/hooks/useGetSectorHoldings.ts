import { executeGQLRequest } from '@src/graphql-request-client';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import {
	IGqlCandleAnalyzerAlertType,
	IGqlPagination,
	IGqlTickerSymbol
} from '../interfaces/IGqlResponses';

const GET_TICKER_SYMBOLS_FOR_SECTOR_QUERY = gql`
	query GetPaginatedTickerSymbolsForSector(
		$gcis: String!
		$page: Int = 1
		$perPage: Int = 20
		$sort: ETickerSymbolsSortMethod = NAME_ASC
	) {
		paginatedTickerSymbols(gcis: $gcis, page: $page, perPage: $perPage, sort: $sort) {
			pagination {
				perPage
				totalPages
				currentPage
			}
			records {
				id
				label
				name
				averageDailyVolume
				candles(periodType: D, periodCount: 1) {
					close
					indicators
					alerts
				}
			}
		}
		candleAnalyzerAlertTypes {
			key
			label
			sentiment
		}
	}
`;

interface IGqlGetSectorResponse {
	paginatedTickerSymbols: {
		pagination: IGqlPagination;
		records: IGqlTickerSymbol[];
	};
	candleAnalyzerAlertTypes: IGqlCandleAnalyzerAlertType[];
}

interface IGetSectorHoldingsParams {
	gcis: string;
	page?: number;
	perPage?: number;
	sort?: string;
}

function useGetSectorHoldings(params: IGetSectorHoldingsParams) {
	const { data, isLoading, error } = useQuery({
		queryKey: ['sector-holdings', params],
		queryFn: async () => {
			const response = await executeGQLRequest<IGqlGetSectorResponse>(
				GET_TICKER_SYMBOLS_FOR_SECTOR_QUERY,
				params
			);

			return response;
		}
	});

	return {
		pagination: data?.paginatedTickerSymbols.pagination,
		records: data?.paginatedTickerSymbols.records ?? [],
		candleAnalyzerAlertTypes: data?.candleAnalyzerAlertTypes ?? [],
		loading: isLoading,
		error
	};
}

export default useGetSectorHoldings;
