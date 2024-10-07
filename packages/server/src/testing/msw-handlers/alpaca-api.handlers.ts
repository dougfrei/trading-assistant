import { HttpResponse, http } from 'msw';

export default [
	http.get('https://data.alpaca.markets/v2/stocks/bars', () =>
		HttpResponse.json({
			bars: {
				SPY: [
					{
						c: 544.61,
						h: 545.44,
						l: 544.61,
						n: 248,
						o: 545.37,
						t: '2024-08-15T08:00:00Z',
						v: 17961,
						vw: 545.022447
					},
					{
						c: 544.64,
						h: 544.73,
						l: 544.11,
						n: 104,
						o: 544.4,
						t: '2024-08-15T08:30:00Z',
						v: 5775,
						vw: 544.346767
					}
				]
			},
			next_page_token: null
		})
	),

	http.get('https://paper-api.alpaca.markets/v2/calendar', () =>
		HttpResponse.json([
			{
				date: '2024-01-02',
				open: '09:30',
				close: '16:00',
				session_open: '0400',
				session_close: '2000',
				settlement_date: '2024-01-04'
			},
			{
				date: '2024-01-03',
				open: '09:30',
				close: '16:00',
				session_open: '0400',
				session_close: '2000',
				settlement_date: '2024-01-05'
			}
		])
	)
];
