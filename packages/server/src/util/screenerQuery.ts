import {
	IScreenerQueryLogicRoot,
	IScreenerQueryLogicValueComparison
} from '@trading-assistant/common';
import * as v from 'valibot';
import { valibotSchemas } from './valibot';

const queryOperatorSchema = v.union(
	[v.literal('>'), v.literal('<'), v.literal('='), v.literal('>='), v.literal('<=')],
	'invalid comparison operator type'
);

const queryLogicSchema = v.pipe(
	v.string(),
	v.toLowerCase(),
	v.union([v.literal('and'), v.literal('or')])
);

const queryLogicIndicatorSchema = v.object({
	indicator: v.string(),
	compare: queryOperatorSchema,
	value: v.union([valibotSchemas.validNumber, v.string()])
});

const queryLogicValueComparisonSchema = v.object({
	leftValue: v.union([valibotSchemas.validNumber, v.string()]),
	operator: queryOperatorSchema,
	rightValue: v.union([valibotSchemas.validNumber, v.string()])
});

const queryLogicRootSchemaNoDepth = v.object({
	logic: queryLogicSchema,
	conditions: v.array(
		v.union([
			v.string(),
			queryLogicIndicatorSchema,
			queryLogicValueComparisonSchema,
			v.object({
				logic: queryLogicSchema
				// TODO: re-visit this to include recursive query logic root validation (https://valibot.dev/guides/other/#lazy-schema)
			})
		])
	)
});

export function isScreenerQueryLogicRoot(obj: unknown): obj is IScreenerQueryLogicRoot {
	const validateResult = v.safeParse(
		v.object({
			logic: queryLogicSchema,
			conditions: v.array(
				v.union([
					v.string(),
					queryLogicIndicatorSchema,
					queryLogicValueComparisonSchema,
					queryLogicRootSchemaNoDepth
				])
			)
		}),
		obj
	);

	return validateResult.success;
}

export function isScreenerQueryValueComparison(
	obj: unknown
): obj is IScreenerQueryLogicValueComparison {
	const validateResult = v.safeParse(queryLogicValueComparisonSchema, obj);

	return validateResult.success;
}
