import { HttpResponse, http } from 'msw';

export default [
	http.get('https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/*', () =>
		HttpResponse.json({
			queryCount: 10584,
			resultsCount: 10584,
			adjusted: true,
			results: [
				{
					T: 'CpN',
					v: 56262,
					vw: 29.7435,
					o: 29.75,
					c: 29.74,
					h: 29.76,
					l: 29.72,
					t: 1724356800000,
					n: 271
				},
				{
					T: 'GBTG',
					v: 323861,
					vw: 6.9528,
					o: 6.95,
					c: 6.94,
					h: 7,
					l: 6.9,
					t: 1724356800000,
					n: 4128
				}
			],
			status: 'OK',
			request_id: 'a41e761435a716413cd796caf0b98a60',
			count: 10584
		})
	),

	http.get('https://api.polygon.io/v3/reference/splits', () =>
		HttpResponse.json({
			results: [
				{
					execution_date: '2024-08-23',
					id: 'E939fd1a113bce7fb474d800e6a58d3c8234d640471b534dcaa3234e7ce535317',
					split_from: 5,
					split_to: 1,
					ticker: 'SSYRF'
				},
				{
					execution_date: '2024-08-23',
					id: 'E3d5ecca84341da3a62b3daea57c99d1a1d5141de4cbe77a0e0251aa8fe0c8163',
					split_from: 10,
					split_to: 1,
					ticker: 'GANDF'
				}
			],
			status: 'OK',
			request_id: '40b21ae9a539e67ad74fe5a60154ac31'
		})
	),

	http.get('https://api.polygon.io/v1/marketstatus/upcoming', () =>
		HttpResponse.json([
			{
				date: '2024-09-02',
				exchange: 'NYSE',
				name: 'Labor Day',
				status: 'closed'
			},
			{
				date: '2024-09-02',
				exchange: 'NASDAQ',
				name: 'Labor Day',
				status: 'closed'
			},
			{
				date: '2024-11-28',
				exchange: 'NYSE',
				name: 'Thanksgiving',
				status: 'closed'
			},
			{
				date: '2024-11-28',
				exchange: 'NASDAQ',
				name: 'Thanksgiving',
				status: 'closed'
			},
			{
				close: '2024-11-29T18:00:00.000Z',
				date: '2024-11-29',
				exchange: 'NYSE',
				name: 'Thanksgiving',
				open: '2024-11-29T14:30:00.000Z',
				status: 'early-close'
			},
			{
				close: '2024-11-29T18:00:00.000Z',
				date: '2024-11-29',
				exchange: 'NASDAQ',
				name: 'Thanksgiving',
				open: '2024-11-29T14:30:00.000Z',
				status: 'early-close'
			},
			{
				close: '2024-12-24T18:00:00.000Z',
				date: '2024-12-24',
				exchange: 'NYSE',
				name: 'Christmas',
				open: '2024-12-24T14:30:00.000Z',
				status: 'early-close'
			},
			{
				close: '2024-12-24T18:00:00.000Z',
				date: '2024-12-24',
				exchange: 'NASDAQ',
				name: 'Christmas',
				open: '2024-12-24T14:30:00.000Z',
				status: 'early-close'
			},
			{
				date: '2024-12-25',
				exchange: 'NYSE',
				name: 'Christmas',
				status: 'closed'
			},
			{
				date: '2024-12-25',
				exchange: 'NASDAQ',
				name: 'Christmas',
				status: 'closed'
			},
			{
				date: '2025-01-01',
				exchange: 'NYSE',
				name: 'New Years Day',
				status: 'closed'
			},
			{
				date: '2025-01-01',
				exchange: 'NASDAQ',
				name: 'New Years Day',
				status: 'closed'
			}
		])
	)
];
