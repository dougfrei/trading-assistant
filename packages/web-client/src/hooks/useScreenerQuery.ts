import { executeGQLRequest } from '@src/graphql-request-client';
import { useQuery } from '@tanstack/react-query';
import { ECandlePeriodType } from '@trading-assistant/common/enums';
import { gql } from 'graphql-request';
import { IGqlPagination, IGqlScreenerRecord } from '../interfaces/IGqlResponses';

interface IGqlGetPaginatedScreenerResultsResponse {
	paginatedScreenerResults: {
		pagination: IGqlPagination;
		records: IGqlScreenerRecord[];
	};
}

const GET_PAGINATED_SCREENER_RESULTS_QUERY = gql`
	query GetPaginatedScreenerResults(
		$periodType: ECandlePeriodType
		$page: Int = 1
		$perPage: Int = 25
		$sort: EScreenerSortMethod = TICKER
		$sectorGCIS: String = ""
		$queryId: Int = 0
	) {
		paginatedScreenerResults(
			periodType: $periodType
			page: $page
			perPage: $perPage
			sort: $sort
			sectorGCIS: $sectorGCIS
			queryId: $queryId
		) {
			pagination {
				currentPage
				totalPages
				perPage
			}
			records {
				tickerSymbol {
					name
					label
					sector {
						name
					}
					averageDailyVolume
				}
				lastCandle {
					period
					periodType
					open
					high
					low
					close
					volume
					indicators
					alerts
				}
				meta {
					change
				}
			}
		}
	}
`;

interface IUseScreenerQueryParams {
	periodType?: ECandlePeriodType;
	page?: number;
	perPage?: number;
	sort?: string;
	sectorGCIS?: string;
	queryId?: number;
}

function useScreenerQuery({
	periodType = ECandlePeriodType.D,
	page = 1,
	perPage = 25,
	sort = 'ticker',
	sectorGCIS = '',
	queryId = 0
}: IUseScreenerQueryParams = {}) {
	const { data, isLoading, error } = useQuery({
		queryKey: ['screener-query', { periodType, page, perPage, sort, sectorGCIS, queryId }],
		queryFn: async () => {
			const response = await executeGQLRequest<IGqlGetPaginatedScreenerResultsResponse>(
				GET_PAGINATED_SCREENER_RESULTS_QUERY,
				{
					periodType,
					page,
					perPage,
					sort,
					sectorGCIS,
					queryId
				}
			);

			return response.paginatedScreenerResults;
		}
	});

	return {
		isLoading,
		error,
		records: data?.records ?? [],
		pagination: data?.pagination ?? {
			currentPage: 1,
			totalPages: 1,
			perPage
		}
	};
}

export default useScreenerQuery;
