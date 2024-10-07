import { executeGQLRequest } from '@src/graphql-request-client';
import { useMutation } from '@tanstack/react-query';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';
import { TTradePositionCreatable } from '@trading-assistant/common/interfaces';
import { gql } from 'graphql-request';
import { useCallback } from 'react';
import { IGqlTrade, IGqlTradePriceLevel } from '../interfaces/IGqlResponses';

const CREATE_TRADE = gql`
	mutation CreateTrade(
		$accountId: Int!
		$instrumentType: ETradeInstrumentType!
		$tickerSymbol: String!
		$notes: String = ""
		$optionSpreadTemplate: String = ""
		$positions: JSON = "{}"
		$stopLossLevels: [TradePriceLevelInputType!] = []
		$profitTargetLevels: [TradePriceLevelInputType!] = []
		$tagIds: [Int!] = []
	) {
		createTrade(
			accountId: $accountId
			instrumentType: $instrumentType
			tickerSymbol: $tickerSymbol
			notes: $notes
			optionSpreadTemplate: $optionSpreadTemplate
			positions: $positions
			stopLossLevels: $stopLossLevels
			profitTargetLevels: $profitTargetLevels
			tagIds: $tagIds
		) {
			id
			instrument {
				name
				label
			}
			notes {
				timestamp
				type
				content
			}
			positions
			profitTargetLevels {
				value
				notes
			}
			stopLossLevels {
				value
				notes
			}
			tags {
				id
				label
			}
			tickerSymbolRecord {
				id
				name
				label
			}
		}
	}
`;

interface ICreateTradeParams {
	accountId: number;
	instrumentType: ETradeInstrumentType;
	tickerSymbol: string;
	notes?: string;
	optionSpreadTemplate?: string;
	positions?: TTradePositionCreatable[];
	stopLossLevels?: IGqlTradePriceLevel[];
	profitTargetLevels?: IGqlTradePriceLevel[];
	tagIds?: number[];
}

function useCreateTrade(onSuccess: (trade: IGqlTrade) => void) {
	const { mutate, error, isPending } = useMutation({
		mutationFn: async (params: ICreateTradeParams) => {
			const result = await executeGQLRequest<{ createTrade: IGqlTrade }>(
				CREATE_TRADE,
				params
			);

			return result.createTrade;
		},
		onSuccess
	});

	const createTrade = useCallback(
		(params: ICreateTradeParams) => {
			mutate(params);
		},
		[mutate]
	);

	return {
		createTrade,
		isCreatingTrade: isPending,
		createTradeError: error
	};
}

export default useCreateTrade;
