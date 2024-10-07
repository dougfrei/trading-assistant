import { IGqlTrade, IGqlTradeNote } from '@src/interfaces/IGqlResponses';
import { createContext, useState } from 'react';

export interface TradesListContext {
	editTradeNoteState: IMutateTradeNoteState | null;
	setEditTradeNoteState: React.Dispatch<React.SetStateAction<IMutateTradeNoteState | null>>;
	deleteTradeNoteState: IMutateTradeNoteState | null;
	setDeleteTradeNoteState: React.Dispatch<React.SetStateAction<IMutateTradeNoteState | null>>;
}

interface IMutateTradeNoteState {
	tradeRecord: IGqlTrade;
	tradeNote: IGqlTradeNote;
}

export const TradesListContext = createContext<TradesListContext | null>(null);

export function TradesListContextProvider({ children }: React.PropsWithChildren) {
	const [editTradeNoteState, setEditTradeNoteState] = useState<IMutateTradeNoteState | null>(
		null
	);
	const [deleteTradeNoteState, setDeleteTradeNoteState] = useState<IMutateTradeNoteState | null>(
		null
	);

	return (
		<TradesListContext.Provider
			value={{
				editTradeNoteState,
				setEditTradeNoteState,
				deleteTradeNoteState,
				setDeleteTradeNoteState
			}}
		>
			{children}
		</TradesListContext.Provider>
	);
}
