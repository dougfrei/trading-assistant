import { Collapse, Group, UnstyledButton, rem } from '@mantine/core';
import { useAppContext } from '@src/context/AppContext';
import { IconChevronRight, IconProps } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import styles from './NavLinksGroup.module.css';
import NavMenuLink from './NavMenuLink';

export interface ILinksGroupProps {
	icon: React.FC<IconProps>;
	label: string;
	link?: string;
	initiallyOpened?: boolean;
	links?: { label: string; link: string }[];
}

export function LinksGroup({ icon: Icon, label, link, initiallyOpened, links }: ILinksGroupProps) {
	const hasLinks = Array.isArray(links);
	const { setMobileMenuOpen } = useAppContext();
	const [opened, setOpened] = useState(initiallyOpened || false);
	const items = (hasLinks ? links : []).map((item) => (
		<Link
			key={item.label}
			to={item.link}
			className={styles.link}
			onClick={() => setMobileMenuOpen(false)}
			activeOptions={{ exact: true }}
		>
			{item.label}
		</Link>
	));

	return hasLinks ? (
		<>
			<UnstyledButton onClick={() => setOpened((o) => !o)} className={styles.control}>
				<Group justify="space-between" gap={0}>
					<NavMenuLink icon={Icon} label={label} />
					<IconChevronRight
						className={styles.chevron}
						stroke={1.5}
						style={{
							width: rem(16),
							height: rem(16),
							transform: opened ? 'rotate(-90deg)' : 'none'
						}}
					/>
				</Group>
			</UnstyledButton>
			<Collapse in={opened}>{items}</Collapse>
		</>
	) : (
		<NavMenuLink icon={Icon} label={label} link={link} className={styles.control} />
	);
}
