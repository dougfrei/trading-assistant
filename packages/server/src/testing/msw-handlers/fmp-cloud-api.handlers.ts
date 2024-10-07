import { HttpResponse, http } from 'msw';

export default [
	http.get(
		'https://fmpcloud.io/api/v3/batch-request-end-of-day-prices',
		() => new HttpResponse(null, { status: 401 })
	),

	http.get('https://fmpcloud.io/api/v3/available-traded/list', () =>
		HttpResponse.json([
			{
				symbol: 'APUE',
				name: 'Trust for Professional Managers',
				price: 34.43,
				exchange: 'New York Stock Exchange Arca',
				exchangeShortName: 'AMEX',
				type: 'etf'
			},
			{
				symbol: 'WEST',
				name: 'Westrock Coffee Company, LLC',
				price: 8.72,
				exchange: 'NASDAQ Global Market',
				exchangeShortName: 'NASDAQ',
				type: 'stock'
			}
		])
	),

	http.get(
		'https://fmpcloud.io/api/v3/stock_split_calendar',
		() => new HttpResponse(null, { status: 401 })
	),

	http.get('https://fmpcloud.io/api/v3/historical-price-full/*', () =>
		HttpResponse.json({
			symbol: 'SPY',
			historical: [
				{
					date: '2024-08-23',
					open: 559.53,
					high: 563.09,
					low: 557.29,
					close: 558.05,
					adjClose: 558.05,
					volume: 26045086,
					unadjustedVolume: 26045086,
					change: -1.48,
					changePercent: -0.26450771,
					vwap: 559.48,
					label: 'August 23, 24',
					changeOverTime: -0.0026450771
				},
				{
					date: '2024-08-22',
					open: 562.56,
					high: 563.18,
					low: 554.98,
					close: 556.22,
					adjClose: 556.22,
					volume: 56121456,
					unadjustedVolume: 56121456,
					change: -6.34,
					changePercent: -1.13,
					vwap: 559.235,
					label: 'August 22, 24',
					changeOverTime: -0.0113
				}
			]
		})
	),

	http.get(
		'https://fmpcloud.io/api/v3/economic_calendar',
		() => new HttpResponse(null, { status: 401 })
	),

	http.get('https://fmpcloud.io/api/v3/stock-screener', () =>
		HttpResponse.json([
			{
				symbol: 'BRK-B',
				companyName: 'Berkshire Hathaway Inc.',
				marketCap: 969697412509,
				sector: 'Financial Services',
				industry: 'Insurance - Diversified',
				beta: 0.869,
				price: 450.07,
				lastAnnualDividend: 0,
				volume: 1268060,
				exchange: 'New York Stock Exchange',
				exchangeShortName: 'NYSE',
				country: 'US',
				isEtf: false,
				isFund: false,
				isActivelyTrading: true
			},
			{
				symbol: 'LLY',
				companyName: 'Eli Lilly and Company',
				marketCap: 897506280320,
				sector: 'Healthcare',
				industry: 'Drug Manufacturers - General',
				beta: 0.409,
				price: 944.32,
				lastAnnualDividend: 5.2,
				volume: 894863,
				exchange: 'New York Stock Exchange',
				exchangeShortName: 'NYSE',
				country: 'US',
				isEtf: false,
				isFund: false,
				isActivelyTrading: true
			}
		])
	)
];
