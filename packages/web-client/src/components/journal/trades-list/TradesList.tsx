import { Center, Group, Loader, Pagination, Stack } from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import useGetTrades from '@src/hooks/useGetTrades';
import { useTradesListContext } from '@src/hooks/useTradesListContext';
import { IGqlTrade } from '@src/interfaces/IGqlResponses';
import { ITradesListRouteData } from '@src/route-loaders/trades-list';
import { useLoaderData } from '@tanstack/react-router';
import { ETradeInstrumentType, ETradeNoteType } from '@trading-assistant/common/enums';
import { useMemo, useState } from 'react';
import AccountSelector from '../controls/AccountSelector';
import InstrumentSelector from '../controls/InstrumentSelector';
import OptionTypeSelector from '../controls/OptionTypeSelector';
import DeleteTradeModal from '../modals/DeleteTradeModal';
import DeleteTradeNoteModal from '../modals/DeleteTradeNoteModal';
import TradeNoteEditorModal from '../modals/TradeNoteEditorModal';
import AddPositionModal from './AddTradePositionModal';
import TradesListRow from './TradesListRow';

const TradesList: React.FC = () => {
	const { tradeAccounts, tradeInstruments, tradeOptionSpreadTemplateGroups, ...loaderData } =
		useLoaderData({
			from: '/_app/journal/'
		}) as ITradesListRouteData;

	const { setEditTradeNoteState, setDeleteTradeNoteState } = useTradesListContext();

	const [page, setPage] = useState(1);
	const [accountId, setAccountId] = useState(0);
	const [selectedInstrumentType, setSelectedInstrumentType] = useState<string | null>(null);
	const [optionSpreadTemplate, setOptionSpreadTemplate] = useState('');
	const [deleteTradeRecord, setDeleteTradeRecord] = useState<IGqlTrade | null>(null);
	const [addPositionTradeRecord, setAddPositionTradeRecord] = useState<IGqlTrade | null>(null);
	const [tradeTags, setTradeTags] = useState(loaderData.tradeTags);

	const { trades, pagination, loading, error, reloadTrades } = useGetTrades({
		page,
		perPage: 25,
		accountId,
		instrumentType: selectedInstrumentType,
		tickerSymbol: '', // TODO: add filter control for searching trades by ticker symbol
		optionSpreadTemplate
	});

	const selectedInstrument = useMemo(
		() => tradeInstruments.find((inst) => inst.name === selectedInstrumentType),
		[selectedInstrumentType, tradeInstruments]
	);

	const handleAccountChange = (newAccountId: number) => {
		setPage(1);
		setAccountId(newAccountId);
		setSelectedInstrumentType(null);
		setOptionSpreadTemplate('');
	};

	const handleInstrumentChange = (newInstrumentType: string) => {
		setPage(1);
		setSelectedInstrumentType(newInstrumentType);
		setOptionSpreadTemplate('');
	};

	const handleOptionSpreadTemplateChange = (newOptionSpreadTemplate: string) => {
		setPage(1);
		setOptionSpreadTemplate(newOptionSpreadTemplate);
	};

	if (error) {
		return (
			<AlertMessage type="error">
				{error?.message ?? 'An error occurred while loading the requested trades.'}
			</AlertMessage>
		);
	}

	return (
		<Stack>
			<Group justify="space-between" align="flex-end">
				<Group>
					<AccountSelector
						accounts={tradeAccounts}
						value={accountId}
						onChange={handleAccountChange}
						disabled={loading}
					/>
					<InstrumentSelector
						instruments={tradeInstruments}
						value={selectedInstrumentType ?? ''}
						onChange={handleInstrumentChange}
						disabled={loading}
					/>

					{selectedInstrument &&
						selectedInstrument.name === ETradeInstrumentType.OPTION && (
							<OptionTypeSelector
								optionSpreadTemplateGroups={tradeOptionSpreadTemplateGroups}
								value={optionSpreadTemplate}
								onChange={handleOptionSpreadTemplateChange}
								disabled={loading}
							/>
						)}
				</Group>
				{pagination !== null && pagination.totalPages > 1 && (
					<Pagination
						withEdges
						total={pagination.totalPages}
						value={page}
						onChange={setPage}
						disabled={loading}
					/>
				)}
			</Group>
			{loading ? (
				<Center mt="xl">
					<Loader />
				</Center>
			) : (
				<>
					{trades.length > 0 ? (
						<>
							{trades.map((trade) => (
								<TradesListRow
									key={trade.id}
									trade={trade}
									instruments={tradeInstruments}
									onDelete={() => setDeleteTradeRecord(trade)}
									onAddPosition={() => setAddPositionTradeRecord(trade)}
									onReview={() =>
										setEditTradeNoteState({
											tradeRecord: trade,
											tradeNote: {
												id: '',
												timestamp: 0,
												type: ETradeNoteType.REVIEW,
												content: ''
											}
										})
									}
								/>
							))}
						</>
					) : (
						<AlertMessage type="warning">No trade records</AlertMessage>
					)}
				</>
			)}
			{pagination !== null && pagination.totalPages > 1 && (
				<Group justify="flex-end" mt="xl" mb="lg">
					<Pagination
						withEdges
						total={pagination.totalPages}
						value={page}
						onChange={setPage}
						disabled={loading}
					/>
				</Group>
			)}
			<DeleteTradeModal
				tradeRecord={deleteTradeRecord}
				onClose={() => setDeleteTradeRecord(null)}
				onDeleted={() => {
					setDeleteTradeRecord(null);
					reloadTrades();
				}}
			/>
			<AddPositionModal
				tradeRecord={addPositionTradeRecord}
				onClose={() => setAddPositionTradeRecord(null)}
				onPositionAdded={() => {
					setAddPositionTradeRecord(null);
					reloadTrades();
				}}
			/>
			<TradeNoteEditorModal
				availableTradeTags={tradeTags}
				onClose={() => setEditTradeNoteState(null)}
				onTradeUpdated={() => {
					setEditTradeNoteState(null);
					reloadTrades();
				}}
				onTagCreated={(newTag) => setTradeTags((curTags) => [...curTags, newTag])}
			/>
			<DeleteTradeNoteModal
				onClose={() => setDeleteTradeNoteState(null)}
				onDeleted={() => {
					setDeleteTradeNoteState(null);
					reloadTrades();
				}}
			/>
		</Stack>
	);
};

export default TradesList;
