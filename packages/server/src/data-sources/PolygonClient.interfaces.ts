import * as v from 'valibot';

export enum EPolygonResponseStatus {
	OK = 'OK',
	NOT_AUTHORIZED = 'NOT_AUTHORIZED'
}

interface IPolygonBaseResponse {
	request_id: string;
	status: EPolygonResponseStatus;
	message?: string; // only used for non-200 responses
}

export interface IPolygonGroupedDailyResponse extends IPolygonBaseResponse {
	queryCount: number;
	resultsCount: number;
	adjusted: boolean;
	results: {
		T: string; // ticker symbol
		v: number; // volume
		vw: number; // VWAP
		o: number; // open
		c: number; // close
		h: number; // high
		l: number; // low
		t: number; // unix timestamp
		n: number; // number of transactions in the aggregate window
	}[];
	count: number;
}

export interface IPolygonStockSplitsResultItem {
	execution_date: string;
	split_from: number;
	split_to: number;
	ticker: string;
}

export interface IPolygonStockSplitsResponse extends IPolygonBaseResponse {
	next_url: string;
	results: IPolygonStockSplitsResultItem[];
}

export interface IPolygonMarketHolidaysItem {
	date: string;
	exchange: string;
	name: string;
	status: string;
	open?: string;
	close?: string;
}

export interface IPolygonNewsItemPublisher {
	name: string;
	homepage_url: string;
	logo_url: string;
	favicon_url: string;
}

export interface IPolygonNewsItemInsight {
	ticker: string;
	sentiment: string;
	sentiment_reasoning: string;
}

export interface IPolygonNewsItem {
	id: string;
	publisher: IPolygonNewsItemPublisher;
	title: string;
	author: string;
	published_utc: string;
	article_url: string;
	tickers: string[];
	image_url: string;
	description: string;
	keywords: string[];
	insights: IPolygonNewsItemInsight[];
}

export interface IPolygonNewsResponse extends IPolygonBaseResponse {
	next_url: string;
	count: number;
	results: IPolygonNewsItem[];
}

export const validPolygonNewsItem = v.object({
	id: v.string(),
	publisher: v.object({
		name: v.string(),
		homepage_url: v.string(),
		logo_url: v.string(),
		favicon_url: v.string()
	}),
	title: v.string(),
	author: v.string(),
	published_utc: v.string(),
	article_url: v.string(),
	tickers: v.array(v.string()),
	image_url: v.string(),
	description: v.string(),
	keywords: v.array(v.string()),
	insights: v.array(
		v.object({
			ticker: v.string(),
			sentiment: v.string(),
			sentiment_reasoning: v.string()
		})
	)
});
