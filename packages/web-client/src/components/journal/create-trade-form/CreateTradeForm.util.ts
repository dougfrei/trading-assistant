import { ComboboxItem } from '@mantine/core';
import { IGqlTradeAccount } from '@src/interfaces/IGqlResponses';

export const getInstrumentOptionsForAccount = (accountId: number, accounts: IGqlTradeAccount[]) => {
	if (!accountId) {
		return [];
	}

	const selectedAccount = accounts.find((account) => account.id === accountId);

	if (!selectedAccount) {
		return [];
	}

	const newValues = selectedAccount.instruments.map<ComboboxItem>((inst) => ({
		value: inst.name,
		label: inst.label
	}));

	return newValues;
};
