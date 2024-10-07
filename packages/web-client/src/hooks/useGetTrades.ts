import { executeGQLRequest } from '@src/graphql-request-client';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { IGqlPagination, IGqlTrade } from '../interfaces/IGqlResponses';

const GET_TRADES = gql`
	query getTrades(
		$page: Int = 1
		$perPage: Int = 25
		$accountId: Int = 0
		$instrumentType: ETradeInstrumentType
		$tickerSymbol: String = ""
		$optionSpreadTemplate: String = ""
	) {
		paginatedTrades(
			page: $page
			perPage: $perPage
			accountId: $accountId
			instrumentType: $instrumentType
			tickerSymbol: $tickerSymbol
			optionSpreadTemplate: $optionSpreadTemplate
		) {
			pagination {
				currentPage
				totalPages
				perPage
			}
			records {
				id
				accountId
				instrumentType
				instrument {
					name
					label
				}
				tickerSymbol
				optionSpreadTemplate
				notes {
					id
					timestamp
					type
					content
				}
				tags {
					id
					type
					label
				}
				profitTargetLevels {
					id
					value
					notes
				}
				stopLossLevels {
					id
					value
					notes
				}
				positions
				openDateTime
				closeDateTime
				isClosed
				pnl
				pnlPercent
				isScratch
				isReviewed
			}
		}
	}
`;

interface IGqlGetTradesResponse {
	paginatedTrades: {
		pagination: IGqlPagination;
		records: IGqlTrade[];
	};
}

interface IGetTradesParams {
	page?: number;
	perPage?: number;
	accountId?: number;
	instrumentType?: string | null;
	tickerSymbol?: string;
	optionSpreadTemplate?: string;
}

function useGetTrades(params: IGetTradesParams) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['trades', params],
		queryFn: async () => {
			const response = await executeGQLRequest<IGqlGetTradesResponse>(GET_TRADES, params);

			return response.paginatedTrades;
		}
	});

	return {
		trades: data?.records ?? [],
		pagination: data?.pagination ?? null,
		loading: isLoading,
		error,
		reloadTrades: async () => {
			await refetch();
		}
	};
}

export default useGetTrades;
