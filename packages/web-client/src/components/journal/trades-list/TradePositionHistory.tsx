import { Badge, Group, Stack, Table } from '@mantine/core';
import { IGqlTrade } from '@src/interfaces/IGqlResponses';
import { getCurrencyFormatter } from '@src/util/currency';
import { ETradeInstrumentType } from '@trading-assistant/common/enums';
import { IOptionTradePosition, IStockTradePosition } from '@trading-assistant/common/interfaces';
import { decodeOptionName } from '@trading-assistant/common/util';

const TradePositionHistory: React.FC<{
	trade: IGqlTrade;
}> = ({ trade }) => {
	const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'short',
		timeStyle: 'short'
	});
	const optionExpirationDateFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'short'
	});
	const usdFormatter = getCurrencyFormatter();

	return (
		<Table striped withTableBorder withColumnBorders>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Date / Time</Table.Th>
					<Table.Th>Quantity</Table.Th>
					<Table.Th>Debit / Credit</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{trade.positions.map((position, index) => {
					let quantityRender: React.ReactNode = null;

					switch (trade.instrumentType) {
						case ETradeInstrumentType.STOCK: {
							const quantity = (position as IStockTradePosition).quantity ?? 0;

							quantityRender = (
								<span>{`${quantity > 0 ? '+' : '-'}${Math.abs(quantity)}`}</span>
							);
							break;
						}

						case ETradeInstrumentType.OPTION: {
							const legs = (position as IOptionTradePosition).optionLegs ?? [];

							quantityRender = (
								<Stack gap="xs">
									{legs.map((leg, legIndex) => {
										const nameParts = decodeOptionName(leg.name);

										return (
											<Group
												key={`${leg.name}_${leg.quantity}_${legIndex}`}
												gap="xs"
											>
												<span>
													{leg.quantity > 0 ? '+' : '-'}
													{Math.abs(leg.quantity)}
												</span>
												<Badge color="gray">
													{optionExpirationDateFormatter.format(
														new Date(nameParts.expirationDate)
													)}{' '}
													{usdFormatter.format(nameParts.strike)}{' '}
													{nameParts.type}
												</Badge>
											</Group>
										);
									})}
								</Stack>
							);
							break;
						}

						default:
							break;
					}

					return (
						<Table.Tr key={`${trade.id}_${position.dateTime}_${index}`}>
							<Table.Td>
								{dateTimeFormatter.format(new Date(position.dateTime))}
							</Table.Td>
							<Table.Td>{quantityRender}</Table.Td>
							<Table.Td>
								<Group gap="xs">
									<span>
										{usdFormatter.format(Math.abs(position.totalAmount))}
									</span>
									<Badge size="sm">
										{position.totalAmount < 0 ? 'debit' : 'credit'}
									</Badge>
								</Group>
							</Table.Td>
						</Table.Tr>
					);
				})}
			</Table.Tbody>
		</Table>
	);
};

export default TradePositionHistory;
