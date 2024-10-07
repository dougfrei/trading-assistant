import { executeGQLRequest } from '@src/graphql-request-client';
import { useQuery } from '@tanstack/react-query';
import { ECandlePeriodType } from '@trading-assistant/common/enums';
import { gql } from 'graphql-request';
import {
	IGqlCandle,
	IGqlCandleAnalyzerChartSeriesGroup,
	IGqlCandleAnalyzerChartType,
	IGqlTickerSymbol
} from '../interfaces/IGqlResponses';

const GET_CANDLES_QUERY = gql`
	query GetCandles($tickerSymbol: String!, $periodType: ECandlePeriodType = D) {
		tickerSymbol(name: $tickerSymbol) {
			name
			label
			sector {
				gcis
				name
			}
			earnings {
				date
				revenue
				eps
			}
		}
		candles(tickerSymbol: $tickerSymbol) {
			period
			periodType
			open
			low
			high
			close
			volume
			indicators
			alerts
		}
		candleAnalyzerMainChartSeriesGroups(periodType: $periodType) {
			groupLabel
			defaultVisible
			series {
				valueTypeId
				seriesLabel
				indicatorKey
				seriesType
				seriesOptions
			}
		}
		candleAnalyzerChartTypes(periodType: $periodType) {
			chartId
			chartLabel
			seriesItems
		}
	}
`;

interface IGqlGetCandlesResponse {
	tickerSymbol: IGqlTickerSymbol;
	candles: IGqlCandle[];
	candleAnalyzerMainChartSeriesGroups: IGqlCandleAnalyzerChartSeriesGroup[];
	candleAnalyzerChartTypes: IGqlCandleAnalyzerChartType[];
}

export function useCandles(tickerSymbol = '', periodType = ECandlePeriodType.D) {
	const { data, isLoading, error } = useQuery({
		queryKey: ['candles', { tickerSymbol, periodType }],
		queryFn: async () => {
			if (tickerSymbol.trim() === '') {
				return null;
			}

			const response = await executeGQLRequest<IGqlGetCandlesResponse>(GET_CANDLES_QUERY, {
				tickerSymbol,
				periodType
			});

			return response;
		}
	});

	return {
		candles: Array.isArray(data?.candles) ? data.candles : [],
		tickerSymbol,
		tickerSymbolRecord: data?.tickerSymbol ?? null,
		mainChartSeriesGroups: Array.isArray(data?.candleAnalyzerMainChartSeriesGroups)
			? data.candleAnalyzerMainChartSeriesGroups
			: [],
		chartTypes: Array.isArray(data?.candleAnalyzerChartTypes)
			? data.candleAnalyzerChartTypes
			: [],
		isLoading,
		errorMessage: error ? error.message : ''
	};
}
