import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Loader,
	Pagination,
	Table,
	TextInput,
	rem
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import CreateUserDrawer from '@src/components/admin/users/CreateUserDrawer';
import DeleteUserModal from '@src/components/admin/users/DeleteUserModal';
import EditUserDrawer from '@src/components/admin/users/EditUserDrawer';
import AlertMessage from '@src/components/ui/AlertMessage';
import { executeGQLRequest } from '@src/graphql-request-client';
import { IGqlPagination, IGqlUser } from '@src/interfaces/IGqlResponses';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router';
import { gql } from 'graphql-request';
import { useState } from 'react';

const GET_USERS_QUERY = gql`
	query GetUsers($page: Int = 1, $perPage: Int = 25, $search: String) {
		users(page: $page, perPage: $perPage, search: $search) {
			pagination {
				currentPage
				totalPages
				perPage
				totalRecords
			}
			records {
				id
				username
				roles
				displayName
				createdAt
				isAdmin
			}
		}
	}
`;

interface IGetUsersResponse {
	users: {
		pagination: IGqlPagination;
		records: IGqlUser[];
	};
}

const ManageUsers: React.FC = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [searchValue, setSearchValue] = useState('');
	const [editUserRecord, setEditUserRecord] = useState<IGqlUser | null>(null);
	const [deleteUserRecord, setDeleteUserRecord] = useState<IGqlUser | null>(null);
	const [createUserDrawerOpen, setCreateUserDrawerOpen] = useState(false);
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['users-list', { currentPage, searchValue }],
		queryFn: async () => {
			const response = await executeGQLRequest<IGetUsersResponse>(GET_USERS_QUERY, {
				perPage: 25,
				page: currentPage,
				search: searchValue
			});

			return response.users;
		}
	});

	const handleSearchFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const fd = new FormData(e.currentTarget);
		const searchValue = fd.get('search_value')?.toString().trim() ?? '';

		setCurrentPage(1);
		setSearchValue(searchValue);
	};

	const handleSearchFormReset = () => {
		setCurrentPage(1);
		setSearchValue('');
	};

	let renderContent = null;

	if (isLoading) {
		renderContent = <Loader />;
	} else if (error) {
		renderContent = <AlertMessage type="error">An error occurred</AlertMessage>;
	} else if (Array.isArray(data?.records)) {
		const dateFormatter = new Intl.DateTimeFormat('en-US', {
			dateStyle: 'short'
		});

		renderContent =
			data.records.length > 0 ? (
				<>
					<Table striped highlightOnHover mt="lg" mb="lg">
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Username</Table.Th>
								<Table.Th>Full Name</Table.Th>
								<Table.Th>Date Created</Table.Th>
								<Table.Th></Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{data.records.map((user) => (
								<Table.Tr key={user.id}>
									<Table.Td>
										<Button
											variant="transparent"
											onClick={() => setEditUserRecord(user)}
										>
											{user.isAdmin && (
												<Badge color="teal" size="sm" radius="sm" mr="xs">
													Admin
												</Badge>
											)}
											{user.username}
										</Button>
									</Table.Td>
									<Table.Td>{user.displayName}</Table.Td>
									<Table.Td>
										{dateFormatter.format(new Date(user.createdAt))}
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
													onClick={() => setDeleteUserRecord(user)}
												/>
											</ActionIcon>
										</Group>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
					<EditUserDrawer
						user={editUserRecord}
						onClose={() => setEditUserRecord(null)}
						onUserUpdated={() => {
							showNotification({
								message: 'User has been updated'
							});

							setEditUserRecord(null);
							refetch();
						}}
					/>
					<DeleteUserModal
						user={deleteUserRecord}
						onCancel={() => setDeleteUserRecord(null)}
						onDeleted={() => {
							showNotification({
								message: 'User has been deleted'
							});

							setDeleteUserRecord(null);
							refetch();
						}}
					/>
				</>
			) : (
				<AlertMessage type="warning" mt="lg">
					No users found
				</AlertMessage>
			);
	}

	const disablePagination = isLoading || typeof error !== 'undefined';

	return (
		<>
			<Group justify="space-between" mt="lg">
				<form onSubmit={handleSearchFormSubmit} onReset={handleSearchFormReset}>
					<Group>
						<TextInput placeholder="Search..." type="search" name="search_value" />
						<Button type="submit" variant="light">
							Search
						</Button>
						{searchValue.trim().length > 0 && (
							<Button type="reset" variant="transparent" color="red" pl={0} pr={0}>
								Clear
							</Button>
						)}
					</Group>
				</form>
				<Button
					leftSection={<IconPlus size={18} />}
					variant="outline"
					onClick={() => setCreateUserDrawerOpen(true)}
				>
					Create User
				</Button>
			</Group>
			{renderContent}
			<Group justify="flex-end">
				<Pagination
					total={data?.pagination?.totalPages ?? 1}
					value={currentPage}
					onChange={setCurrentPage}
					disabled={disablePagination}
				/>
			</Group>
			<CreateUserDrawer
				isOpen={createUserDrawerOpen}
				onClose={() => setCreateUserDrawerOpen(false)}
				onUserCreated={() => {
					showNotification({
						message: 'User has been created'
					});

					setCreateUserDrawerOpen(false);
					refetch();
				}}
			/>
		</>
	);
};

export default ManageUsers;

export const Route = createLazyFileRoute('/_app/_admin/admin/users')({
	component: ManageUsers
});
