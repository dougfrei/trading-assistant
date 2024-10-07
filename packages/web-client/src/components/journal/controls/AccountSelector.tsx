import { Select } from '@mantine/core';
import { IGqlTradeAccount } from '@src/interfaces/IGqlResponses';

const AccountSelector: React.FC<{
	accounts: IGqlTradeAccount[];
	value: number;
	onChange: (value: number) => void;
	label?: string;
	allOptionLabel?: string;
	disabled?: boolean;
}> = ({
	accounts,
	value,
	onChange,
	label = 'Account',
	allOptionLabel = 'All Accounts',
	disabled = false
}) => {
	return (
		<Select
			label={label}
			data={[
				{ value: '0', label: allOptionLabel },
				...accounts.map((account) => ({
					value: account.id.toString(),
					label: account.label
				}))
			]}
			allowDeselect={false}
			value={value.toString()}
			onChange={(newValue) => onChange(newValue ? parseInt(newValue) : 0)}
			disabled={disabled}
		/>
	);
};

export default AccountSelector;
