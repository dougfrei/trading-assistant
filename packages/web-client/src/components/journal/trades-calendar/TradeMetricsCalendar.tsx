import {
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Loader,
	SegmentedControl,
	Select,
	Stack,
	Title
} from '@mantine/core';
import AlertMessage from '@src/components/ui/AlertMessage';
import ETradePerformancePeriodType from '@src/enums/ETradePerformancePeriodType';
import useGetTradePerformance from '@src/hooks/useGetTradePerformance';
import { ITradeCalendarRouteData } from '@src/route-loaders/trade-calendar';
import { getCurrencyFormatter } from '@src/util/currency';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { useLoaderData } from '@tanstack/react-router';
import {
	addMonths,
	addYears,
	format,
	getDaysInMonth,
	startOfMonth,
	startOfYear,
	subMonths,
	subYears
} from 'date-fns';
import { useState } from 'react';
import styles from './TradeMetricsCalendar.module.css';
import TradeMetricsCalendarStats from './TradeMetricsCalendarStats';

interface ComponentProps {
	className?: string;
	periodType?: ETradePerformancePeriodType;
	startDate?: Date;
	numPeriods?: number;
}

const TradeMetricsCalendar: React.FC<ComponentProps> = ({
	className = '',
	periodType = ETradePerformancePeriodType.DAY,
	startDate = startOfMonth(new Date()),
	numPeriods = getDaysInMonth(new Date())
}) => {
	const { tradeAccounts, tradeInstruments } = useLoaderData({
		from: '/_app/journal/calendar'
	}) as ITradeCalendarRouteData;
	const [queryPeriodType, setQueryPeriodType] = useState(periodType);
	const [queryStartDate, setQueryStartDate] = useState(startDate);
	const [queryNumPeriods, setQueryNumPeriods] = useState(numPeriods);
	const [queryAccountId, setQueryAccountId] = useState(0);
	const [queryInstrumentName, setQueryInstrumentName] = useState('');
	const { tradePerformance, loading, error } = useGetTradePerformance({
		startDate: queryStartDate,
		periodType: queryPeriodType,
		numPeriods: queryNumPeriods,
		accountId: queryAccountId,
		instrumentName: queryInstrumentName
	});

	const usdFormatter = getCurrencyFormatter();

	const getRefetchParams = () => {
		return {
			startDate: queryStartDate,
			periodType: queryPeriodType,
			numPeriods: queryNumPeriods,
			accountId: queryAccountId,
			instrumentName: queryInstrumentName
		};
	};

	const handlePrevNext = (direction: 'prev' | 'next') => {
		const refetchParams = getRefetchParams();

		switch (queryPeriodType) {
			case ETradePerformancePeriodType.DAY:
				setQueryStartDate(
					startOfMonth(
						direction === 'next'
							? addMonths(queryStartDate, 1)
							: subMonths(queryStartDate, 1)
					)
				);
				setQueryNumPeriods(getDaysInMonth(refetchParams.startDate));
				break;

			case ETradePerformancePeriodType.MONTH:
				setQueryStartDate(
					startOfYear(
						direction === 'next'
							? addYears(queryStartDate, 1)
							: subYears(queryStartDate, 1)
					)
				);
				break;
		}
	};

	const handleAccountChange = (newAccountId: number) => {
		setQueryAccountId(newAccountId);
	};

	const handleInstrumentChange = (newInstrumentName: string) => {
		setQueryInstrumentName(newInstrumentName);
	};

	const handlePeriodTypeChange = (newPeriodType: string) => {
		setQueryPeriodType(newPeriodType as ETradePerformancePeriodType);

		const params = {
			...getRefetchParams(),
			periodType: newPeriodType
		};

		switch (newPeriodType) {
			case ETradePerformancePeriodType.DAY:
				params.startDate = startOfMonth(new Date());
				params.numPeriods = getDaysInMonth(params.startDate);

				setQueryStartDate(params.startDate);
				setQueryNumPeriods(params.numPeriods);
				break;

			case ETradePerformancePeriodType.MONTH:
				params.startDate = startOfYear(new Date());
				params.numPeriods = 12;

				setQueryStartDate(params.startDate);
				setQueryNumPeriods(params.numPeriods);
				break;

			default:
				break;
		}
	};

	if (loading) {
		return <Loader />;
	}

	if (error) {
		return (
			<AlertMessage type="error">
				{error.message ?? 'An error occurred while loading the trade calendar data'}
			</AlertMessage>
		);
	}

	const calendarItems = tradePerformance?.periods ?? null;

	if (!calendarItems || !Array.isArray(calendarItems) || !calendarItems.length) {
		return <AlertMessage type="warning">No trades exist for this period</AlertMessage>;
	}

	const dummyItems: number[] = [];

	if (queryPeriodType === ETradePerformancePeriodType.DAY) {
		const offset = new Date(calendarItems[0].period).getDay();

		for (let i = 0; i < offset; i++) {
			dummyItems.push(i);
		}
	}

	let titleDateFormat = 'MMMM yyyy';
	let tileDateFormat = 'd';

	switch (queryPeriodType) {
		case ETradePerformancePeriodType.MONTH:
			titleDateFormat = 'yyyy';
			tileDateFormat = 'MMM';
			break;

		default:
			break;
	}

	let rootClassPeriodType = styles.rootDay;

	switch (queryPeriodType) {
		case ETradePerformancePeriodType.MONTH:
			rootClassPeriodType = styles.rootMonth;
			break;

		default:
			break;
	}

	return (
		<Stack>
			<Group justify="space-between">
				<Group>
					<Select
						label="Account"
						data={[
							{ value: '0', label: 'All Accounts' },
							...tradeAccounts.map((account) => ({
								value: account.id.toString(),
								label: account.label
							}))
						]}
						allowDeselect={false}
						value={queryAccountId.toString()}
						onChange={(value) => handleAccountChange(value ? parseInt(value) : 0)}
					/>
					<Select
						label="Instrument"
						data={[
							{ value: '', label: 'All Instruments' },
							...tradeInstruments.map((inst) => ({
								value: inst.name,
								label: inst.label
							}))
						]}
						allowDeselect={false}
						value={queryInstrumentName}
						onChange={(value) => handleInstrumentChange(value ?? '')}
					/>
				</Group>
				<Group>
					<SegmentedControl
						data={[
							{ label: 'Month', value: ETradePerformancePeriodType.DAY },
							{ label: 'Year', value: ETradePerformancePeriodType.MONTH }
						]}
						value={queryPeriodType}
						onChange={handlePeriodTypeChange}
					/>
				</Group>
			</Group>
			<Divider />
			<Group justify="space-between">
				<Button
					onClick={() => handlePrevNext('prev')}
					variant="light"
					leftSection={<IconArrowLeft size={14} />}
				>
					{format(
						queryPeriodType === ETradePerformancePeriodType.MONTH
							? subYears(queryStartDate, 1)
							: subMonths(queryStartDate, 1),
						queryPeriodType === ETradePerformancePeriodType.MONTH ? 'yyyy' : 'MMMM'
					)}
				</Button>
				<Title order={2}>{format(queryStartDate, titleDateFormat)}</Title>
				<Button
					onClick={() => handlePrevNext('next')}
					variant="light"
					rightSection={<IconArrowRight size={14} />}
				>
					{format(
						queryPeriodType === ETradePerformancePeriodType.MONTH
							? addYears(queryStartDate, 1)
							: addMonths(queryStartDate, 1),
						queryPeriodType === ETradePerformancePeriodType.MONTH ? 'yyyy' : 'MMMM'
					)}
				</Button>
			</Group>
			{typeof tradePerformance !== 'undefined' && (
				<TradeMetricsCalendarStats performance={tradePerformance} />
			)}
			<Box className={`${styles.root} ${rootClassPeriodType} ${className}`}>
				{queryPeriodType === ETradePerformancePeriodType.DAY && (
					<>
						<div className={styles.dayOfWeek}>Sun</div>
						<div className={styles.dayOfWeek}>Mon</div>
						<div className={styles.dayOfWeek}>Tue</div>
						<div className={styles.dayOfWeek}>Wed</div>
						<div className={styles.dayOfWeek}>Thu</div>
						<div className={styles.dayOfWeek}>Fri</div>
						<div className={styles.dayOfWeek}>Sat</div>
						{dummyItems.map((dummy) => (
							<div key={dummy} className={styles.cell}></div>
						))}
					</>
				)}
				{calendarItems.map((item) => {
					const numTrades = item.numWinners + item.numLosers + item.numScratch;
					const onlyScratch = numTrades && !item.numWinners && !item.numLosers;
					const classes = [styles.cell];

					if (numTrades > 0) {
						if (onlyScratch) {
							classes.push(styles.cellBgNeutral);
						} else if (item.pnl > 0) {
							classes.push(styles.cellBgPositive);
						} else {
							classes.push(styles.cellBgNegative);
						}
					}

					return (
						<div key={item.period} className={classes.join(' ')}>
							<div className={styles.cellHeader}>
								<span className={styles.dayOfMonth}>
									{format(new Date(item.period), tileDateFormat)}
								</span>
								<span>
									{numTrades > 0
										? numTrades + (numTrades === 1 ? ' trade' : ' trades')
										: ''}
								</span>
							</div>
							{numTrades > 0 && (
								<Stack gap="xs" align="center">
									<span>{usdFormatter.format(item.pnl)}</span>
									<Group gap="xs">
										<Badge size="sm" radius="xs" color="green">
											{item.numWinners}
										</Badge>
										<Badge size="sm" radius="xs" color="red">
											{item.numLosers}
										</Badge>
										<Badge size="sm" radius="xs" color="gray">
											{item.numScratch}
										</Badge>
									</Group>
									<span>{item.winRate}% WR</span>
									<span>{item.profitFactor} PF</span>
								</Stack>
							)}
						</div>
					);
				})}
			</Box>
		</Stack>
	);
};

export default TradeMetricsCalendar;
