type TScreenerQueryOperator = '>' | '<' | '=' | '>=' | '<=';

export interface IScreenerQueryLogicIndicator {
	indicator: string;
	compare: TScreenerQueryOperator;
	value: number | string;
}

export interface IScreenerQueryLogicValueComparison {
	leftValue: string | number;
	operator: TScreenerQueryOperator;
	rightValue: string | number;
}

type TScreenerQueryLogicCondition = string | IScreenerQueryLogicIndicator | IScreenerQueryLogicRoot;

export interface IScreenerQueryLogicRoot {
	logic: 'and' | 'or';
	conditions: TScreenerQueryLogicCondition[];
}
