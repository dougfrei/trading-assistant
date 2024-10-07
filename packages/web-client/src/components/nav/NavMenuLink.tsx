import { Box, ThemeIcon } from '@mantine/core';
import { useAppContext } from '@src/context/AppContext';
import { IconProps } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import styles from './NavMenuLink.module.css';

const NavMenuLink: React.FC<{
	icon: React.FC<IconProps>;
	label: string;
	link?: string;
	className?: string;
}> = ({ icon: Icon, label, link, className }) => {
	const { setMobileMenuOpen } = useAppContext();

	return typeof link === 'string' ? (
		<Link
			to={link}
			className={[styles.container, className ?? ''].join(' ')}
			onClick={() => setMobileMenuOpen(false)}
		>
			<ThemeIcon variant="light" size={30}>
				<Icon className={styles.icon} />
			</ThemeIcon>
			<Box ml="md">{label}</Box>
		</Link>
	) : (
		<Box className={[styles.container, className ?? ''].join(' ')}>
			<ThemeIcon variant="light" size={30}>
				<Icon className={styles.icon} />
			</ThemeIcon>
			<Box ml="md">{label}</Box>
		</Box>
	);
};

export default NavMenuLink;
