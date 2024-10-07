import { ActionIcon, Button, Group, Loader, Table, rem } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import CreateTradeAccountDrawer from '@src/components/journal/trade-accounts/CreateTradeAccountDrawer';
import DeleteTradeAccountModal from '@src/components/journal/trade-accounts/DeleteTradeAccountModal';
import EditTradeAccountDrawer from '@src/components/journal/trade-accounts/EditTradeAccountDrawer';
import AlertMessage from '@src/components/ui/AlertMessage';
import { IGqlTradeAccount } from '@src/interfaces/IGqlResponses';
import { ITradeAccountsRouteData } from '@src/route-loaders/trade-accounts';
import { IconTrash } from '@tabler/icons-react';
import { createLazyFileRoute, useLoaderData } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';

const JournalAccountsView: React.FC = () => {
	const data = useLoaderData({
		from: '/_app/journal/accounts'
	}) as ITradeAccountsRouteData;
	const [tradeAccounts, setTradeAccounts] = useState(data.tradeAccounts ?? []);
	const [editAccountRecord, setEditAccountRecord] = useState<IGqlTradeAccount | null>(null);
	const [deleteAccountRecord, setDeleteAccountRecord] = useState<IGqlTradeAccount | null>(null);
	const [createAccountDrawerOpen, setCreateAccountDrawerOpen] = useState(false);

	const instrumentNameMap = useMemo(
		() => new Map(data.tradeInstruments.map((inst) => [inst.name, inst.label])),
		[data.tradeInstruments]
	);

	const handleTradeAccountUpdate = useCallback((updatedAccount: IGqlTradeAccount) => {
		showNotification({
			message: 'Trade account has been updated'
		});

		setEditAccountRecord(null);
		setTradeAccounts((curAccounts) => {
			const targetIndex = curAccounts.findIndex(
				(account) => account.id === updatedAccount.id
			);

			return targetIndex !== -1 ? curAccounts.with(targetIndex, updatedAccount) : curAccounts;
		});
	}, []);

	const handleTradeAccountDeleted = useCallback((deletedAccount: IGqlTradeAccount) => {
		showNotification({
			message: 'Trade account has been deleted'
		});

		setDeleteAccountRecord(null);
		setTradeAccounts((curAccounts) =>
			curAccounts.filter((account) => account.id !== deletedAccount.id)
		);
	}, []);

	return (
		<>
			{tradeAccounts.length > 0 ? (
				<>
					<Table striped highlightOnHover mt="lg" mb="lg">
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Account Name</Table.Th>
								<Table.Th>Supported Instruments</Table.Th>
								<Table.Th></Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{tradeAccounts.map((account) => (
								<Table.Tr key={account.id}>
									<Table.Td>
										<Button
											variant="transparent"
											onClick={() => setEditAccountRecord(account)}
										>
											{account.label}
										</Button>
									</Table.Td>
									<Table.Td>
										{account.supportedInstruments
											.map((inst) => instrumentNameMap.get(inst) ?? '')
											.join(', ')}
									</Table.Td>
									<Table.Td>
										<Group justify="flex-end">
											<ActionIcon
												variant="outline"
												size="lg"
												aria-label="Delete"
												color="red"
											>
												<IconTrash
													style={{ width: rem(20) }}
													stroke={1.5}
													onClick={() => setDeleteAccountRecord(account)}
												/>
											</ActionIcon>
										</Group>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
					<EditTradeAccountDrawer
						tradeAccount={editAccountRecord}
						instruments={data.tradeInstruments}
						onTradeAccountUpdated={handleTradeAccountUpdate}
						onClose={() => setEditAccountRecord(null)}
					/>
					<DeleteTradeAccountModal
						tradeAccount={deleteAccountRecord}
						onDeleted={handleTradeAccountDeleted}
						onCancel={() => setDeleteAccountRecord(null)}
					/>
				</>
			) : (
				<p>No trade accounts currently exist</p>
			)}
			<Button onClick={() => setCreateAccountDrawerOpen(true)}>Create Trade Account</Button>
			<CreateTradeAccountDrawer
				isOpen={createAccountDrawerOpen}
				onClose={() => setCreateAccountDrawerOpen(false)}
				onTradeAccountCreated={(newAccount) => {
					showNotification({
						message: 'Trade account has been created'
					});

					setCreateAccountDrawerOpen(false);
					setTradeAccounts((curAccounts) => [...curAccounts, newAccount]);
				}}
				instruments={data.tradeInstruments}
			/>
		</>
	);
};

export default JournalAccountsView;

export const Route = createLazyFileRoute('/_app/journal/accounts')({
	component: JournalAccountsView,
	pendingComponent: () => <Loader />,
	errorComponent: ({ error }) => {
		return (
			<AlertMessage type="error">
				{error.message ?? 'An error occurred while loading the the trade accounts'}
			</AlertMessage>
		);
	}
});
