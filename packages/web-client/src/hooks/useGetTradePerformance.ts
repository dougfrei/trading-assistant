import ETradePerformancePeriodType from '@src/enums/ETradePerformancePeriodType';
import { executeGQLRequest } from '@src/graphql-request-client';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { IGqlTradePerformance } from '../interfaces/IGqlResponses';

const GET_TRADE_PERFORMANCE = gql`
	query getTradePerformance(
		$startDate: DateTime!
		$periodType: ETradePeriodType!
		$numPeriods: Int!
		$accountId: Int!
		$instrumentType: ETradeInstrumentType
	) {
		tradePerformance(
			startDate: $startDate
			periodType: $periodType
			numPeriods: $numPeriods
			accountId: $accountId
			instrumentType: $instrumentType
		) {
			totalPnl
			totalWinRate
			totalProfitFactor
			totalWinners
			totalLosers
			totalScratch
			periods {
				periodType
				period
				pnl
				winRate
				profitFactor
				numWinners
				numLosers
				numScratch
			}
		}
	}
`;

interface IGetTradePerformanceParams {
	startDate: Date;
	periodType: ETradePerformancePeriodType;
	numPeriods: number;
	accountId: number;
	instrumentName: string;
}

function useGetTradePerformance(params: IGetTradePerformanceParams) {
	const { data, isLoading, error } = useQuery({
		queryKey: ['trade-performance', params],
		queryFn: async () => {
			const response = await executeGQLRequest<{ tradePerformance: IGqlTradePerformance }>(
				GET_TRADE_PERFORMANCE,
				params
			);

			return response.tradePerformance;
		}
	});

	return {
		tradePerformance: data,
		loading: isLoading,
		error
	};
}

export default useGetTradePerformance;
