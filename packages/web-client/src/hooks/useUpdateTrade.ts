import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlTrade, IGqlTradeNote, IGqlTradePriceLevel } from '@src/interfaces/IGqlResponses';
import { useMutation } from '@tanstack/react-query';
import { ETradeInstrumentType, ETradeNoteType } from '@trading-assistant/common/enums';
import { TTradePosition } from '@trading-assistant/common/interfaces';
import { gql } from 'graphql-request';
import { useCallback } from 'react';
import * as v from 'valibot';

const UPDATE_TRADE_MUTATION = gql`
	mutation UpdateTrade(
		$id: Int!
		$accountId: Int
		$instrumentType: ETradeInstrumentType
		$tickerSymbol: String
		$notes: [TradeNoteInputType!]
		$optionSpreadTemplate: String
		$positions: JSON
		$stopLossLevels: [TradePriceLevelInputType!]
		$profitTargetLevels: [TradePriceLevelInputType!]
		$tagIds: [Int!]
	) {
		updateTrade(
			id: $id
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
			tickerSymbol
			tickerSymbolRecord {
				id
				name
				label
			}
		}
	}
`;

export interface IUpdateTradeParams {
	accountId?: number;
	instrumentType?: ETradeInstrumentType;
	tickerSymbol?: string;
	notes?: IGqlTradeNote[];
	optionSpreadTemplate?: string;
	positions?: TTradePosition[];
	stopLossLevels?: IGqlTradePriceLevel[];
	profitTargetLevels?: IGqlTradePriceLevel[];
	tagIds?: number[];
}

function useUpdateTrade(onSuccess: (updatedTrade: IGqlTrade) => void) {
	const { mutate, error, isPending, reset } = useMutation({
		mutationFn: async (variables: Partial<IGqlTrade>) => {
			const result = await executeGQLRequest<{ updateTrade: IGqlTrade }>(
				UPDATE_TRADE_MUTATION,
				variables
			);

			return result.updateTrade;
		},
		onSuccess
	});

	const updateTrade = useCallback(
		(
			tradeId: number,
			{
				accountId,
				instrumentType,
				tickerSymbol,
				notes,
				optionSpreadTemplate,
				positions,
				stopLossLevels,
				profitTargetLevels,
				tagIds
			}: IUpdateTradeParams
		) => {
			const updateVariables: Partial<IUpdateTradeParams> = {};

			if (typeof accountId !== 'undefined') {
				updateVariables.accountId = accountId;
			}

			if (typeof instrumentType !== 'undefined') {
				updateVariables.instrumentType = instrumentType;
			}

			if (typeof tickerSymbol !== 'undefined') {
				updateVariables.tickerSymbol = tickerSymbol;
			}

			if (typeof notes !== 'undefined') {
				const validatedNotes = v.safeParse(
					v.array(
						v.object({
							id: v.optional(v.string(), ''),
							timestamp: v.optional(v.number(), new Date().getTime()),
							content: v.string(),
							type: v.enum(ETradeNoteType, 'Invalid note type')
						})
					),
					notes
				);

				if (validatedNotes.success) {
					updateVariables.notes = validatedNotes.output;
				}
			}

			if (typeof optionSpreadTemplate !== 'undefined') {
				updateVariables.optionSpreadTemplate = optionSpreadTemplate;
			}

			if (typeof positions !== 'undefined') {
				updateVariables.positions = positions;
			}

			if (typeof stopLossLevels !== 'undefined') {
				updateVariables.stopLossLevels = stopLossLevels;
			}

			if (typeof profitTargetLevels !== 'undefined') {
				updateVariables.profitTargetLevels = profitTargetLevels;
			}

			if (typeof tagIds !== 'undefined') {
				updateVariables.tagIds = tagIds;
			}

			mutate({
				id: tradeId,
				...updateVariables
			});
		},
		[mutate]
	);

	return {
		updateTrade,
		isUpdatingTrade: isPending,
		updateTradeError: error ?? null,
		resetUpdateTradeStatus: reset
	};
}

export default useUpdateTrade;
