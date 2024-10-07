import { SimpleGrid, Tabs } from '@mantine/core';
import AccountChangePassword from '@src/components/account/AccountChangePassword';
import AccountProfile from '@src/components/account/AccountProfile';
import { IconPassword, IconUser } from '@tabler/icons-react';
import { createLazyFileRoute } from '@tanstack/react-router';

const AccountPage: React.FC = () => {
	return (
		<Tabs defaultValue="profile" keepMounted={false}>
			<Tabs.List>
				<Tabs.Tab value="profile" leftSection={<IconUser size={18} />}>
					Profile
				</Tabs.Tab>
				<Tabs.Tab value="change-password" leftSection={<IconPassword size={18} />}>
					Change Password
				</Tabs.Tab>
			</Tabs.List>
			<Tabs.Panel value="profile">
				<SimpleGrid cols={{ xs: 1, md: 3 }} mt="lg">
					<AccountProfile />
				</SimpleGrid>
			</Tabs.Panel>
			<Tabs.Panel value="change-password">
				<SimpleGrid cols={{ xs: 1, md: 3 }} mt="lg">
					<AccountChangePassword />
				</SimpleGrid>
			</Tabs.Panel>
		</Tabs>
	);
};

export const Route = createLazyFileRoute('/_app/account/')({
	component: () => <AccountPage />
});
