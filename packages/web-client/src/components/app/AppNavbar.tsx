import { AppShell, Button, Divider, Group, ScrollArea, Stack } from '@mantine/core';
import { ILinksGroupProps, LinksGroup } from '@src/components/nav/NavLinksGroup';
import { useAppContext } from '@src/context/AppContext';
import { IconChartLine, IconClipboardList, IconHome2, IconNotebook } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import AccountMenu from '../AccountMenu';
import styles from './AppNavbar.module.css';

const menuData: ILinksGroupProps[] = [
	{ label: 'Dashboard', icon: IconHome2, link: '/' },
	{
		label: 'Journal',
		icon: IconNotebook,
		links: [
			{ label: 'Trades', link: '/journal' },
			{ label: 'Add Trade', link: '/journal/add' },
			{ label: 'Stats', link: '/journal/calendar' },
			{ label: 'Accounts', link: '/journal/accounts' },
			{ label: 'Tags', link: '/journal/tags' }
		]
	},
	{ label: 'Sectors', icon: IconClipboardList, link: '/sectors' },
	{ label: 'Screener', icon: IconClipboardList, link: '/screener' },
	{ label: 'Charts', icon: IconChartLine, link: '/charts/SPY' }
];

const AppNavbar: React.FC = () => {
	const { setRiskCalculatorOpen } = useAppContext();
	const navigate = useNavigate();

	return (
		<AppShell.Navbar p="md">
			<Stack hiddenFrom="md" mb="lg">
				<AccountMenu menuPosition="bottom" />
				<Divider />
			</Stack>
			<ScrollArea className={styles.links}>
				<div className={styles.linksInner}>
					{menuData.map((item) => (
						<LinksGroup key={item.label} {...item} />
					))}
				</div>
			</ScrollArea>
			<Divider label="Quick Actions" />
			<Group mt="md" justify="space-around">
				<Button variant="subtle" onClick={() => navigate({ to: '/journal/add' })}>
					Add Trade
				</Button>
				<Button variant="subtle" onClick={() => setRiskCalculatorOpen(true)}>
					Risk Calculator
				</Button>
			</Group>
		</AppShell.Navbar>
	);
};

export default AppNavbar;
