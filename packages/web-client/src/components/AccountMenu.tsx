import { Button, FloatingPosition, Menu, rem } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { DEFAULT_LOGOUT_ERROR_MESSAGE } from '@src/constants';
import { useAppContext } from '@src/context/AppContext';
import { useAuth } from '@src/hooks/useAuth';
import { getErrorObjectMessage } from '@src/util/errors';
import { IconLogout, IconSettings, IconUsers } from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

const AccountMenu: React.FC<{
	menuPosition?: FloatingPosition;
}> = ({ menuPosition = 'bottom-end' }) => {
	const auth = useAuth();
	const router = useRouter();
	const { setFullscreenLoaderActive } = useAppContext();

	const handleLogout = useCallback(() => {
		const doLogout = async () => {
			setFullscreenLoaderActive(true);

			try {
				await auth.logout();

				await router.invalidate();

				// NOTE: see the README for why this is wrapped in a zero-delay setTimeout
				setTimeout(() => {
					router.navigate({ to: '/login' });
				}, 0);
			} catch (err: unknown) {
				showNotification({
					color: 'red',
					message: getErrorObjectMessage(err, DEFAULT_LOGOUT_ERROR_MESSAGE)
				});
			}

			setFullscreenLoaderActive(false);
		};

		doLogout();
	}, []);

	const canManageUsers = auth.user?.isAdmin ?? false;

	return auth.user ? (
		<Menu withArrow position={menuPosition} arrowPosition="center">
			<Menu.Target>
				<Button variant="subtle">{auth.user?.displayName}</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
					component={Link}
					to="/account"
				>
					Settings
				</Menu.Item>
				{auth.user.isAdmin && (
					<>
						<Menu.Divider />
						{canManageUsers && (
							<Menu.Item
								leftSection={
									<IconUsers style={{ width: rem(14), height: rem(14) }} />
								}
								component={Link}
								to="/admin/users"
							>
								Manage Users
							</Menu.Item>
						)}
					</>
				)}
				<Menu.Divider />
				<Menu.Item
					color="red"
					leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
					onClick={handleLogout}
				>
					Logout
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	) : null;
};

export default AccountMenu;
