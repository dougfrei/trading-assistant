import { HttpResponse, http } from 'msw';

export default [
	http.get('https://simple-fetch-mock.com/get', () =>
		HttpResponse.json([
			{
				name: 'key1',
				value: 'value1'
			},
			{
				name: 'key2',
				value: 123
			}
		])
	),

	http.get('https://simple-fetch-mock.com/get/empty-array', () => HttpResponse.json([])),

	http.post('https://simple-fetch-mock.com/post', () =>
		HttpResponse.json({
			status: 'success',
			data: {
				foo: 'bar'
			}
		})
	),

	http.get(
		'https://simple-fetch-mock.com/get/response-error',
		() => new HttpResponse(null, { status: 401 })
	),

	http.get('https://simple-fetch-mock.com/get/network-failure', () => HttpResponse.error())
];
