import { TradesListContext } from '@src/context/TradesListContext';
import { useContext } from 'react';

export function useTradesListContext() {
	const context = useContext(TradesListContext);

	if (!context) {
		throw new Error('useTradesListContext must be used within TradesListContextProvider');
	}

	return context;
}
