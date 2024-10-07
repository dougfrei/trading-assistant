import { Spotlight, SpotlightActionData } from '@mantine/spotlight';
import '@mantine/spotlight/styles.css';
import { useAppContext } from '@src/context/AppContext';
import { useNavigate } from '@tanstack/react-router';

const CommandPalette: React.FC = () => {
	const { setRiskCalculatorOpen } = useAppContext();
	const navigate = useNavigate();

	const actions: SpotlightActionData[] = [
		{
			id: 'add-trade',
			label: 'Add Trade',
			description: 'Create a new trade entry',
			onClick: () => navigate({ to: '/journal/add' })
		},
		{
			id: 'risk-calculator',
			label: 'Risk Calculator',
			description: 'Open the risk calculator',
			onClick: () => setRiskCalculatorOpen(true)
		}
	];

	return (
		<Spotlight
			actions={actions}
			nothingFound="Nothing found..."
			highlightQuery
			searchProps={{
				placeholder: 'Select action...'
			}}
		/>
	);
};

export default CommandPalette;
