import { HttpResponse, graphql, http } from 'msw';
import tickerSymbolNews from './msw-responses/tickerSymbolNews';

const gql = graphql.link('https://api-trading.local.com:3000/graphql');

const mockAccessToken = 'mock-access-token';
const mockUserResponse = {
	username: 'mockuser@test.com',
	displayName: 'Mock User',
	isAdmin: true
};

export default [
	http.get('https://api-trading.local.com:3000/auth/user', ({ request }) => {
		const accessToken = request.headers.get('x-access-token');

		return accessToken === mockAccessToken
			? HttpResponse.json(mockUserResponse)
			: HttpResponse.json(
					{
						message: 'Unauthorized',
						statusCode: 401
					},
					{ status: 401 }
				);
	}),
	http.post('https://api-trading.local.com:3000/auth/login', () => {
		return HttpResponse.json(mockUserResponse, {
			headers: {
				'X-Access-Token': mockAccessToken
			}
		});
	}),
	gql.query(
		'GetTickerSymbolNews',
		async () => {
			console.log('GetTickerSymbolNews query intercept');

			return HttpResponse.json({
				data: {
					tickerSymbolNews
				}
			});
		},
		{}
	)
];
