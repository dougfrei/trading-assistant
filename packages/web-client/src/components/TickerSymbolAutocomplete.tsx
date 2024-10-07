import {
	Autocomplete,
	Badge,
	Group,
	Loader,
	MantineSize,
	Text,
	rem,
	useMatches
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { executeGQLRequest } from '@src/graphql-request-client';
import { IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useMemo, useState } from 'react';

const SEARCH_TICKER_SYMBOLS_QUERY = gql`
	query SearchTickerSymbols($query: String!) {
		searchTickerSymbols(query: $query) {
			name
			label
		}
	}
`;

interface IGqlSearchTickerSymbolsResponse {
	searchTickerSymbols: [
		{
			name: string;
			label: string;
		}
	];
}

const TickerSymbolAutocomplete: React.FC<{
	onSelectTickerSymbol: (tickerSymbol: string) => void;
	initialValue?: string;
	placeholder?: string;
	clearAfterSelect?: boolean;
}> = ({
	onSelectTickerSymbol,
	initialValue = '',
	placeholder = 'Ex: SPY',
	clearAfterSelect = false
}) => {
	const [value, setValue] = useState(initialValue);
	const [debouncedValue] = useDebouncedValue(value, 250);
	const { data: rawSearchResults, isLoading } = useQuery({
		queryKey: ['ticker-symbol-search', debouncedValue],
		queryFn: async () => {
			if (!debouncedValue.trim()) {
				return [];
			}

			const response = await executeGQLRequest<IGqlSearchTickerSymbolsResponse>(
				SEARCH_TICKER_SYMBOLS_QUERY,
				{ query: debouncedValue }
			);

			return response.searchTickerSymbols;
		}
	});

	const optionsMap = useMemo(() => {
		if (!rawSearchResults || !Array.isArray(rawSearchResults)) {
			return new Map();
		}

		return new Map((rawSearchResults ?? []).map((item) => [item.name, item.label]));
	}, [rawSearchResults]);

	const inputSize = useMatches<MantineSize>({
		base: 'xs',
		md: 'md'
	});

	return (
		<Group align="center">
			<Autocomplete
				radius="xl"
				size={inputSize}
				style={{ width: '100%' }}
				placeholder={placeholder}
				data={Array.from(optionsMap.keys())}
				value={value}
				onChange={setValue}
				onOptionSubmit={(curVal) => {
					onSelectTickerSymbol(curVal.toUpperCase());

					if (clearAfterSelect) {
						// defer the clearing of the value to the next frame
						// since the control is setting the value after this
						// callback is executed
						setTimeout(() => setValue(''), 0);
					}
				}}
				leftSection={
					<IconSearch style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
				}
				rightSection={isLoading && <Loader size="sm" />}
				renderOption={({ option }) => {
					return (
						<Group gap="sm" wrap="nowrap">
							<Badge>{option.value.toUpperCase()}</Badge>
							<Text>{optionsMap.get(option.value) ?? ''}</Text>
						</Group>
					);
				}}
				filter={({ options }) => options}
			/>
		</Group>
	);
};

export default TickerSymbolAutocomplete;
