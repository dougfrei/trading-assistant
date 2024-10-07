import { HttpResponse, http } from 'msw';

export default [
	http.get(
		'https://financialmodelingprep.com/api/v3/earning_calendar',
		() => new HttpResponse(null, { status: 401 })
	),

	http.get('https://financialmodelingprep.com/api/v3/symbol/*', () =>
		HttpResponse.json([
			{
				symbol: 'AAA',
				name: 'AXS First Priority CLO Bond ETF',
				price: 25.1585,
				changesPercentage: 0.2131,
				change: 0.0535,
				dayLow: 25.11,
				dayHigh: 25.1585,
				yearHigh: 25.24,
				yearLow: 24.124,
				marketCap: 12531273,
				priceAvg50: 24.98028,
				priceAvg200: 24.758366,
				exchange: 'AMEX',
				volume: 744,
				avgVolume: 6349,
				open: 25.11,
				previousClose: 25.105,
				eps: 0,
				pe: null,
				earningsAnnouncement: null,
				sharesOutstanding: 498093,
				timestamp: 1705683329
			},
			{
				symbol: 'AAMC',
				name: 'Altisource Asset Management Corporation',
				price: 4.8,
				changesPercentage: -7.1567,
				change: -0.37,
				dayLow: 4.5901,
				dayHigh: 5.07,
				yearHigh: 60.882355,
				yearLow: 2.64,
				marketCap: 13267824,
				priceAvg50: 3.9944,
				priceAvg200: 20.714727,
				exchange: 'AMEX',
				volume: 34630,
				avgVolume: 101317,
				open: 5.0677,
				previousClose: 5.17,
				eps: -6.12,
				pe: -0.78,
				earningsAnnouncement: '2024-03-21T12:30:00.000+0000',
				sharesOutstanding: 2764130,
				timestamp: 1705687914
			}
		])
	),

	http.get('https://financialmodelingprep.com/api/v3/historical-price-full/*', () =>
		HttpResponse.json({
			symbol: 'AAPL',
			historical: [
				{
					date: '2024-08-23',
					open: 225.6589,
					high: 228.22,
					low: 224.34,
					close: 226.355,
					adjClose: 226.355,
					volume: 21461143,
					unadjustedVolume: 21461143,
					change: 0.6961,
					changePercent: 0.30847443,
					vwap: 226.3,
					label: 'August 23, 24',
					changeOverTime: 0.0030847443
				},
				{
					date: '2024-08-22',
					open: 227.79,
					high: 228.34,
					low: 223.9,
					close: 224.53,
					adjClose: 224.53,
					volume: 43695321,
					unadjustedVolume: 43695321,
					change: -3.26,
					changePercent: -1.43,
					vwap: 226.14,
					label: 'August 22, 24',
					changeOverTime: -0.0143
				}
			]
		})
	),

	http.get('https://financialmodelingprep.com/api/v3/stock-screener', () =>
		HttpResponse.json([
			{
				symbol: 'V',
				companyName: 'Visa Inc.',
				marketCap: 556229529208,
				sector: 'Financial Services',
				industry: 'Credit Services',
				beta: 0.951,
				price: 277.18,
				lastAnnualDividend: 2.08,
				volume: 3848209,
				exchange: 'New York Stock Exchange',
				exchangeShortName: 'NYSE',
				country: 'US',
				isEtf: false,
				isActivelyTrading: true
			},
			{
				symbol: 'TSM',
				companyName: 'Taiwan Semiconductor Manufacturing Company Limited',
				marketCap: 520802151927,
				sector: 'Technology',
				industry: 'Semiconductors',
				beta: 1.183,
				price: 115.75,
				lastAnnualDividend: 1.92,
				volume: 10021518,
				exchange: 'New York Stock Exchange',
				exchangeShortName: 'NYSE',
				country: 'TW',
				isEtf: false,
				isActivelyTrading: true
			}
		])
	)
];
