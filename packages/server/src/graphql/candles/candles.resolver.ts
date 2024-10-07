import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ECandlePeriodType, ECandleSortOrder } from '@trading-assistant/common';
import { GraphQLError } from 'graphql';
import { AppConfigService } from 'src/app-config/appConfig.service';
import { IDataloaders } from 'src/graphql-dataloader/GQLDataloader.service';
import { DbCandleService } from 'src/services/db/dbCandle.service';
import {
	getAnalyzerChartTypes,
	getAnalyzerMainChartSeriesGroups,
	getAnalyzerSetAlertTypes,
	getAnalyzerSetIndicatorTypes,
	getAnalyzerVolumeChartSeriesGroups
} from 'src/util/analyze';
import { Candle } from './candle.model';
import { CandleAnalyzerAlertType } from './candleAnalyzerAlertType.model';
import { CandleAnalyzerChartSeriesGroup } from './candleAnalyzerChartSeriesGroup.model';
import { CandleAnalyzerChartType } from './candleAnalyzerChartType.model';
import { CandleAnalyzerIndicatorType } from './candleAnalyzerIndicatorType.model';
import { CandlesArgs } from './candles.args';

@Resolver(() => Candle)
export class CandlesResolver {
	constructor(
		private readonly dbCandleService: DbCandleService,
		private readonly appConfig: AppConfigService
	) {}

	@Query(() => [CandleAnalyzerChartSeriesGroup])
	async candleAnalyzerMainChartSeriesGroups(
		@Args({
			name: 'periodType',
			type: () => ECandlePeriodType,
			defaultValue: ECandlePeriodType.D
		})
		periodType: ECandlePeriodType
	) {
		const analyzerSet = await this.appConfig.getAnalyzerConfigForPeriodType(periodType, {
			referenceCandles: { market: [], sector: [] }
		});

		const records = getAnalyzerMainChartSeriesGroups(analyzerSet);

		const res: CandleAnalyzerChartSeriesGroup[] = records.map((record) => ({
			groupLabel: record.groupLabel,
			defaultVisible: record.defaultVisible ?? false,
			series: record.series.map((seriesItem) => ({
				valueTypeId: seriesItem.valueTypeId,
				seriesLabel: seriesItem.seriesLabel,
				indicatorKey: seriesItem.indicatorKey,
				seriesType: seriesItem.seriesType,
				seriesOptions: seriesItem.seriesOptions
			}))
		}));

		return res;
	}

	@Query(() => [CandleAnalyzerChartSeriesGroup])
	async candleAnalyzerVolumeChartSeriesGroups(
		@Args({
			name: 'periodType',
			type: () => ECandlePeriodType,
			defaultValue: ECandlePeriodType.D
		})
		periodType: ECandlePeriodType
	) {
		const analyzerSet = await this.appConfig.getAnalyzerConfigForPeriodType(periodType, {
			referenceCandles: { market: [], sector: [] }
		});

		const records = getAnalyzerVolumeChartSeriesGroups(analyzerSet);

		const res: CandleAnalyzerChartSeriesGroup[] = records.map((record) => ({
			groupLabel: record.groupLabel,
			defaultVisible: record.defaultVisible ?? false,
			series: record.series.map((seriesItem) => ({
				valueTypeId: seriesItem.valueTypeId,
				seriesLabel: seriesItem.seriesLabel,
				indicatorKey: seriesItem.indicatorKey,
				seriesType: seriesItem.seriesType,
				seriesOptions: seriesItem.seriesOptions
			}))
		}));

		return res;
	}

	@Query(() => [CandleAnalyzerChartType])
	async candleAnalyzerChartTypes(
		@Args({
			name: 'periodType',
			type: () => ECandlePeriodType,
			defaultValue: ECandlePeriodType.D
		})
		periodType: ECandlePeriodType
	) {
		const analyzerSet = await this.appConfig.getAnalyzerConfigForPeriodType(periodType, {
			referenceCandles: { market: [], sector: [] }
		});

		const records = getAnalyzerChartTypes(analyzerSet);

		const res: CandleAnalyzerChartType[] = records.map((record) => ({
			chartId: record.chartId,
			chartLabel: record.chartLabel,
			seriesItems: record.seriesItems
		}));

		return res;
	}

	@Query(() => [CandleAnalyzerIndicatorType])
	async candleAnalyzerIndicatorTypes(
		@Args({
			name: 'periodType',
			type: () => ECandlePeriodType,
			defaultValue: ECandlePeriodType.D
		})
		periodType: ECandlePeriodType
	) {
		const analyzerSet = await this.appConfig.getAnalyzerConfigForPeriodType(periodType, {
			referenceCandles: { market: [], sector: [] }
		});

		const records = getAnalyzerSetIndicatorTypes(analyzerSet);

		const res: CandleAnalyzerIndicatorType[] = records.map((record) => ({
			key: record.key,
			label: record.label
		}));

		return res;
	}

	@Query(() => [CandleAnalyzerAlertType])
	async candleAnalyzerAlertTypes(
		@Args({
			name: 'periodType',
			type: () => ECandlePeriodType,
			defaultValue: ECandlePeriodType.D
		})
		periodType: ECandlePeriodType
	) {
		const analyzerSet = await this.appConfig.getAnalyzerConfigForPeriodType(periodType, {
			referenceCandles: { market: [], sector: [] }
		});

		const records = getAnalyzerSetAlertTypes(analyzerSet);

		return records.map((record) => ({
			key: record.key,
			label: record.label,
			sentiment: record.sentiment
		}));
	}

	@Query(() => [Candle], { name: 'candles' })
	async getCandles(@Args() candlesArgs: CandlesArgs): Promise<Candle[]> {
		try {
			const rawCandles = await this.dbCandleService.getCandlesByTickerSymbolName(
				candlesArgs.tickerSymbol,
				{
					periodType: candlesArgs.periodType,
					order:
						candlesArgs.sortOrder === ECandleSortOrder.PERIOD_DESC
							? 'period_desc'
							: 'period_asc',
					limit: candlesArgs.limit
				}
			);

			const candlesRes = rawCandles.map((candle) => Candle.fromEntity(candle));

			return candlesRes;
		} catch (err: unknown) {
			throw new GraphQLError(
				err instanceof Error && err.message.trim().length
					? err.message.trim()
					: 'An error occurred'
			);
		}
	}

	@ResolveField('periodISO', () => String)
	getPeriodISO(@Parent() candle: Candle) {
		return new Date(candle.period).toISOString();
	}

	@ResolveField('indicatorValue', () => Number, { nullable: true })
	getIndicatorValue(
		@Parent() candle: Candle,
		@Args('key', {
			type: () => String,
			nullable: false
		})
		key: string
	) {
		return candle.indicators[key] ?? null;
	}

	@ResolveField('relativeStrengthWeakness', () => Number, {
		nullable: true,
		description:
			'Calculate the RS/RW values in comparison to the specified ticker symbol in real-time without saving to the DB.'
	})
	getRsRw(
		@Parent() candle: Candle,
		@Args('compareTickerSymbol', { type: () => String, nullable: true, defaultValue: '' })
		compareTickerSymbol: string,
		@Context() { loaders }: { loaders: IDataloaders }
	) {
		const key = JSON.stringify({
			candleObj: candle,
			compareTickerSymbol
		});

		return loaders.candleRsRwLoader.load(key);
	}
}
