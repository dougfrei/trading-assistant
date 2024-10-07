import { AppShell, Burger, Flex } from '@mantine/core';
import { useAppContext } from '@src/context/AppContext';
import { useNavigate } from '@tanstack/react-router';
import AccountMenu from '../AccountMenu';
import TickerSymbolAutocomplete from '../TickerSymbolAutocomplete';
import styles from './AppHeader.module.css';

const AppHeader: React.FC = () => {
	const { mobileMenuOpen, setMobileMenuOpen } = useAppContext();
	const navigate = useNavigate();

	return (
		<AppShell.Header p="md" className={styles.appHeader}>
			<Burger
				opened={mobileMenuOpen}
				onClick={() => setMobileMenuOpen((prevState) => !prevState)}
				hiddenFrom="md"
				size="sm"
				mr="md"
			/>
			<TickerSymbolAutocomplete
				placeholder="Search for a ticker symbol..."
				onSelectTickerSymbol={(symbol) =>
					navigate({ to: '/charts/$symbol', params: { symbol } })
				}
				clearAfterSelect
			/>
			<Flex justify="flex-end" visibleFrom="md">
				<AccountMenu />
			</Flex>
		</AppShell.Header>
	);
};

export default AppHeader;
