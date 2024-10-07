import { Button, Card, Fieldset, Input, Stack } from '@mantine/core';
import { useCreateTradeFormContext } from '../CreateTradeForm.context';
import PriceTargetRow from '../PriceTargetRow';

const StopLossAndProfitTargets: React.FC = () => {
	const form = useCreateTradeFormContext();

	return (
		<Fieldset legend="Stop Loss & Profit Target Levels">
			<Stack>
				<Card>
					<Stack>
						<Input.Label>Stop Loss Levels</Input.Label>
						{form.getValues().stopLosses.map((stopLoss, index) => (
							<PriceTargetRow
								key={form.key(`stopLosses.${index}`)}
								keyPath="stopLosses"
								rowIndex={index}
							/>
						))}
						<Button
							variant="light"
							onClick={() =>
								form.insertListItem('stopLosses', { value: 0, notes: '' })
							}
						>
							Add Stop Loss
						</Button>
					</Stack>
				</Card>
				<Card>
					<Stack>
						<Input.Label>Profit Target Levels</Input.Label>
						{form.getValues().profitTargets.map((profitTarget, index) => (
							<PriceTargetRow
								key={form.key(`profitTargets.${index}`)}
								keyPath="profitTargets"
								rowIndex={index}
							/>
						))}
						<Button
							variant="light"
							onClick={() =>
								form.insertListItem('profitTargets', { value: 0, notes: '' })
							}
						>
							Add Profit Target
						</Button>
					</Stack>
				</Card>
			</Stack>
		</Fieldset>
	);
};

export default StopLossAndProfitTargets;
