import { isValidYMDdateString } from '@trading-assistant/common';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

export const YMDDateString = new GraphQLScalarType({
	name: 'YMDDateString',
	description: 'A date string in YYYY-MM-DD format compliant with the ISO 8601 standard.',
	serialize(value) {
		if (typeof value !== 'string') {
			throw new GraphQLError(
				`GraphQL YMDDateString scalar serializer expected a string, not ${typeof value}`
			);
		}

		if (!isValidYMDdateString(value)) {
			throw new GraphQLError(
				`GraphQL YMDDateString scalar serializer expected a valid YYYY-MM-DD formatted string`
			);
		}

		return value;
	},
	parseValue(value) {
		if (typeof value !== 'string') {
			throw new GraphQLError(
				`GraphQL YMDDateString scalar parser expected a string, not ${typeof value}`
			);
		}

		if (!isValidYMDdateString(value)) {
			throw new GraphQLError(
				`GraphQL YMDDateString scalar parser expected a valid YYYY-MM-DD formatted string`
			);
		}

		return value;
	},
	parseLiteral(ast) {
		if (ast.kind !== Kind.STRING) {
			throw new GraphQLError(
				`GraphQL YMDDateString AST parser expected a string, not ${ast.kind}`
			);
		}

		if (!isValidYMDdateString(ast.value)) {
			throw new GraphQLError(
				'GraphQL YMDDateString AST parser expected a valid YYYY-MM-DD formatted string'
			);
		}

		return ast.value;
	}
});
