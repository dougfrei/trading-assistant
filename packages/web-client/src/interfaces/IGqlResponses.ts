import {
	ECandlePeriodType,
	ETradeInstrumentType,
	ETradeNoteType,
	ETradeTagType
} from '@trading-assistant/common/enums';
import { IScreenerQueryLogicRoot, TTradePosition } from '@trading-assistant/common/interfaces';
import ETradePerformancePeriodType from '../enums/ETradePerformancePeriodType';

export type TGqlSide = 'BUY' | 'SELL';

export enum EGqlSide {
	BUY = 'BUY',
	SELL = 'SELL'
}

export enum EGqlOptionType {
	CALL = 'CALL',
	PUT = 'PUT'
}

export interface IGqlTickerSymbolEarnings {
	date: string;
	revenue: number;
	eps: number;
}

export interface IGqlTickerSymbol {
	id: number;
	name: string;
	label: string;
	gcis: string;
	sector?: IGqlSector;
	earnings?: IGqlTickerSymbolEarnings[];
	candles?: IGqlCandle[];
	averageDailyVolume: number;
}

export interface IGqlSector {
	gcis: string;
	name: string;
	etfTickerSymbol: IGqlTickerSymbol;
	tickerSymbols: IGqlTickerSymbol[];
}

export interface IGqlScreenerSortMethod {
	name: string;
	label: string;
}

export interface IGqlScreenerQuery {
	id: number;
	label: string;
	description: string;
	query: IScreenerQueryLogicRoot;
}

export interface IGqlPagination {
	currentPage: number;
	totalPages: number;
	perPage: number;
}

export interface IGqlCandle {
	period: number;
	periodType: ECandlePeriodType;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	indicators: Record<string, number>;
	alerts: string[];
}

export interface IGqlScreenerRecord {
	tickerSymbol: IGqlTickerSymbol;
	lastCandle: IGqlCandle;
	meta: {
		change: number;
	};
}

export enum EGqlCandleAnalyzerAlertTypeSentiment {
	BULLISH = 'bullish',
	BEARISH = 'bearish',
	NEUTRAL = 'neutral'
}

export interface IGqlCandleAnalyzerIndicatorType {
	key: string;
	label: string;
}

export interface IGqlCandleAnalyzerAlertType {
	key: string;
	label: string;
	sentiment: EGqlCandleAnalyzerAlertTypeSentiment;
}

type TSeriesType = 'line' | 'histogram';

export interface IChartSeriesTypeLine {
	lineStyle?: 'solid' | 'dotted' | 'dashed' | 'large-dashed' | 'sparse-dotted';
	lineWidth?: number;
	color?: string;
}

export interface IChartSeriesTypeHistogram {
	priceFormatType?: 'price' | 'percent' | 'volume';
	color?: string;
}

interface IChartPriceLine {
	price: number;
	color?: string;
	lineWidth?: number;
	axisLabelVisible?: boolean;
}

export interface IGqlCandleAnalyzerChartSeries {
	valueTypeId: string;
	seriesLabel: string;
	indicatorKey: string;
	seriesType: TSeriesType;
	seriesOptions: IChartSeriesTypeLine | IChartSeriesTypeHistogram;
}

export interface IGqlCandleAnalyzerChartSeriesGroup {
	groupLabel: string;
	defaultVisible: boolean;
	series: IGqlCandleAnalyzerChartSeries[];
}

interface IChartTypeSeriesItem {
	label: string;
	indicatorKey: string;
	type: TSeriesType;
	options: IChartSeriesTypeLine | IChartSeriesTypeHistogram;
	priceLines?: IChartPriceLine[];
}

export interface IGqlCandleAnalyzerChartType {
	chartId: string;
	chartLabel: string;
	seriesItems: IChartTypeSeriesItem[];
}

export interface IGqlTradeInstrument {
	name: ETradeInstrumentType;
	label: string;
}

export interface IGqlTradeAccount {
	id: number;
	label: string;
	supportedInstruments: ETradeInstrumentType[];
	instruments: IGqlTradeInstrument[];
}

export interface IGqlTradeTag {
	id: number;
	type: ETradeTagType;
	label: string;
}

export interface IGqlTradeOptionSpreadTemplateLeg {
	type: EGqlOptionType;
	strikeGroup: number;
	expirationGroup: number;
	quantity: number;
	quantityMultiplier: number;
	editableFields: string[];
	compareWithPreviousLeg: {
		strike: string;
		expiration: string;
	};
}

export interface IGqlTradeOptionSpreadTemplate {
	name: string;
	label: string;
	legs: IGqlTradeOptionSpreadTemplateLeg[];
}

export interface IGqlTradeOptionSpreadTemplateGroup {
	groupName: string;
	templates: IGqlTradeOptionSpreadTemplate[];
}

export interface IGqlTradePriceLevel {
	id: string;
	value: number;
	notes: string;
}

export interface IGqlTrade {
	id: number;
	accountId: number;
	instrumentType: ETradeInstrumentType;
	instrument: IGqlTradeInstrument;
	tickerSymbol: string;
	tickerSymbolRecord: IGqlTickerSymbol;
	optionSpreadTemplate?: string;
	tags: IGqlTradeTag[];
	stopLossLevels: IGqlTradePriceLevel[];
	profitTargetLevels: IGqlTradePriceLevel[];
	positions: TTradePosition[];
	notes: IGqlTradeNote[];
	openDateTime: string | null;
	closeDateTime: string | null;
	isClosed: boolean;
	pnl: number;
	pnlPercent: number;
	isScratch: boolean;
	isReviewed: boolean;
}

export interface IGqlTradePerformance {
	totalPnl: number;
	totalWinRate: number;
	totalProfitFactor: number;
	totalWinners: number;
	totalLosers: number;
	totalScratch: number;
	periods: IGqlTradePerformancePeriod[];
}

export interface IGqlTradePerformancePeriod {
	periodType: ETradePerformancePeriodType;
	period: string;
	pnl: number;
	winRate: number;
	profitFactor: number;
	numWinners: number;
	numLosers: number;
	numScratch: number;
}

export interface IGqlUser {
	id: number;
	username: string;
	displayName: string;
	roles: string[];
	active: boolean;
	createdAt: string;
	isAdmin: boolean;
}

export interface IGqlUserRoleType {
	name: string;
	label: string;
	description: string;
}

export interface IGqlTickerSymbolNewsPublisher {
	name: string;
	homepageURL: string;
	logoURL: string;
	faviconURL: string;
}

export interface IGqlTickerSymbolNewsInsight {
	ticker: string;
	sentiment: string;
	sentimentReasoning: string;
}

export interface IGqlTickerSymbolNews {
	id: string;
	publisher: IGqlTickerSymbolNewsPublisher;
	title: string;
	author: string;
	publishedUTC: string;
	articleURL: string;
	tickers: string[];
	imageURL: string;
	description: string;
	keywords: string[];
	insights: IGqlTickerSymbolNewsInsight[];
}

export interface IGqlTradeNote {
	id: string;
	timestamp: number;
	type: ETradeNoteType;
	content: string;
}
