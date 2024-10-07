import { Button, Fieldset, Select, Stack } from '@mantine/core';
// import { ComboboxItem } from '@mantine/core';
import { IGqlTradeAccount } from '@src/interfaces/IGqlResponses';
import { IconPlus } from '@tabler/icons-react';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';
import { useMemo } from 'react';
import { useCreateTradeFormContext } from '../CreateTradeForm.context';
import { getInstrumentOptionsForAccount } from '../CreateTradeForm.util';
import styles from './AccountAndInstrument.module.css';

const AccountAndInstrument: React.FC<{
	tradeAccounts: IGqlTradeAccount[];
	onCreateAccount: () => void;
}> = ({ tradeAccounts, onCreateAccount }) => {
	const form = useCreateTradeFormContext();
	const accountSelectItems = useMemo(
		() =>
			(tradeAccounts ?? []).map((account) => ({
				value: account.id.toString(),
				label: account.label
			})),
		[tradeAccounts]
	);
	const instrumentOptions = useMemo(
		() => getInstrumentOptionsForAccount(parseInt(form.getValues().accountId), tradeAccounts),
		[form.getValues().accountId, tradeAccounts]
	);

	form.watch('accountId', ({ value }) => {
		const newAccountId = parseInt(value ?? '0');

		if (newAccountId && tradeAccounts) {
			const newOpts = getInstrumentOptionsForAccount(newAccountId, tradeAccounts);

			form.setFieldValue(
				'instrumentName',
				(newOpts[0]?.value as ETradeInstrumentType) ?? null
			);
		} else {
			form.setFieldValue('instrumentName', null);
		}
	});

	return (
		<>
			<Fieldset legend="Account & Instrument">
				<Stack>
					<div className={styles.accountContainer}>
						<Select
							label="Account"
							allowDeselect={false}
							data={accountSelectItems}
							data-autofocus
							key={form.key('accountId')}
							{...form.getInputProps('accountId')}
						/>
						<Button
							variant="light"
							onClick={onCreateAccount}
							leftSection={<IconPlus size={14} />}
						>
							Add Account
						</Button>
					</div>
					<Select
						label="Instrument"
						allowDeselect={false}
						data={instrumentOptions}
						disabled={instrumentOptions.length < 2}
						key={form.key('instrumentName')}
						{...form.getInputProps('instrumentName')}
					/>
				</Stack>
			</Fieldset>
		</>
	);
};

export default AccountAndInstrument;
