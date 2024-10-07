import {
	Accordion,
	ActionIcon,
	Badge,
	Button,
	Card,
	DefaultMantineColor,
	Divider,
	Group,
	Menu,
	Paper,
	SimpleGrid,
	Stack,
	Text
} from '@mantine/core';
import { IGqlTrade, IGqlTradeInstrument } from '@src/interfaces/IGqlResponses';
import { getCurrencyFormatter } from '@src/util/currency';
import { IconArrowRight, IconNotes, IconPlus, IconSettings, IconTrash } from '@tabler/icons-react';
import { ETradeTagType } from '@trading-assistant/common/enums';
import { useMemo } from 'react';
import TradePositionHistory from './TradePositionHistory';
import TradesListRowNotes from './TradesListRowNotes';

const TradesListRow: React.FC<{
	trade: IGqlTrade;
	instruments: IGqlTradeInstrument[];
	onDelete: () => void;
	onAddPosition: () => void;
	onReview: () => void;
}> = ({ trade, instruments, onDelete, onAddPosition, onReview }) => {
	const instIndex = instruments.findIndex((inst) => inst.name === trade.instrumentType);
	const instBadgeColors: DefaultMantineColor[] = ['blue', 'orange', 'red', 'yellow'];
	const setupTags = useMemo(
		() => trade.tags.filter((tag) => tag.type === ETradeTagType.SETUP),
		[trade]
	);
	const reviewTags = useMemo(
		() => trade.tags.filter((tag) => tag.type === ETradeTagType.REVIEW),
		[trade]
	);
	const usdFormatter = getCurrencyFormatter();
	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
	return (
		<Card>
			<Stack>
				<Group justify="space-between">
					<Group>
						{trade.isClosed ? (
							<>
								{trade.isScratch ? (
									<Badge variant="outline" color="gray" radius="xs">
										scratch
									</Badge>
								) : (
									<>
										<Badge
											variant="outline"
											color={trade.pnl > 0 ? 'green' : 'red'}
											radius="xs"
										>
											{trade.pnlPercent}% {usdFormatter.format(trade.pnl)}
										</Badge>
									</>
								)}
							</>
						) : (
							<Badge variant="dot" color="green" radius="xs" mr="sm">
								open
							</Badge>
						)}
					</Group>
					<Group>
						{trade.isClosed && (
							<>
								{!trade.isReviewed && (
									<Button
										onClick={onReview}
										size="compact-sm"
										leftSection={<IconNotes size={14} />}
									>
										Add Review
									</Button>
								)}
							</>
						)}
						<Menu shadow="md" position="bottom-end" withinPortal={true} withArrow>
							<Menu.Target>
								<ActionIcon variant="light" color="gray">
									<IconSettings size={14} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									color="red"
									leftSection={<IconTrash size={14} />}
									onClick={onDelete}
								>
									Delete
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Group>
				</Group>
				<Group justify="space-between">
					<Group gap="xs">
						<Paper withBorder p="xs">
							<strong>{trade.tickerSymbol}</strong>
						</Paper>
						{instIndex >= 0 && (
							<Badge
								variant="outline"
								radius="sm"
								color={instBadgeColors[instIndex] ?? 'gray'}
							>
								{instruments[instIndex].label}
							</Badge>
						)}
					</Group>
					{trade.openDateTime !== null && (
						<Group gap="xs">
							<Text size="sm" fw="bold">
								{dateFormatter.format(new Date(trade.openDateTime))}
							</Text>
							{trade.closeDateTime !== null && (
								<>
									<IconArrowRight size={16} />
									<Text size="sm" fw="bold">
										{dateFormatter.format(new Date(trade.closeDateTime))}
									</Text>
								</>
							)}
						</Group>
					)}
				</Group>
				{(setupTags.length > 0 || reviewTags.length > 0) && (
					<SimpleGrid
						cols={{ base: 1, md: setupTags.length && reviewTags.length ? 2 : 1 }}
					>
						{setupTags.length > 0 && (
							<Stack gap="xs">
								<Divider label="Setup Tags" labelPosition="left" />
								<Group>
									{setupTags.map((tag) => (
										<Badge key={tag.id} variant="light" color="indigo">
											{tag.label}
										</Badge>
									))}
								</Group>
							</Stack>
						)}
						{reviewTags.length > 0 && (
							<Stack gap="xs">
								<Divider label="Review Tags" labelPosition="left" />
								<Group>
									{reviewTags.map((tag) => (
										<Badge key={tag.id} variant="light" color="cyan">
											{tag.label}
										</Badge>
									))}
								</Group>
							</Stack>
						)}
					</SimpleGrid>
				)}
				<Divider />
				<Accordion
					variant="separated"
					defaultValue={trade.isClosed ? [] : ['position-history']}
					multiple={true}
					chevronPosition="left"
				>
					<Accordion.Item value="position-history">
						<Accordion.Control>
							<Text size="sm" fw="bold">
								Position History
							</Text>
						</Accordion.Control>
						<Accordion.Panel>
							<Stack>
								<TradePositionHistory trade={trade} />
								{!trade.isClosed && (
									<Group justify="flex-end">
										<Button
											variant="subtle"
											size="compact-sm"
											leftSection={<IconPlus size={14} />}
											onClick={onAddPosition}
										>
											Add Position Change
										</Button>
									</Group>
								)}
							</Stack>
						</Accordion.Panel>
					</Accordion.Item>
					<Accordion.Item value="notes">
						<Accordion.Control>
							<Text size="sm" fw="bold">
								Notes{trade.isReviewed && ' & Review'}
							</Text>
						</Accordion.Control>
						<Accordion.Panel>
							<TradesListRowNotes trade={trade} />
						</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			</Stack>
		</Card>
	);
};

export default TradesListRow;
