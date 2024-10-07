import { ETradeOptionType } from '@trading-assistant/common';

export type TOptionSpreadTemplateLegCompareLogic = '<' | '<=' | '=' | '>=' | '>' | '';

export interface IOptionSpreadTemplateGroup {
	groupName: string;
	templates: IOptionSpreadTemplate[];
}

export interface IOptionSpreadTemplate {
	name: string;
	label: string;
	legs: IOptionSpreadTemplateLeg[];
}

export interface IOptionSpreadTemplateLegCompare {
	strike?: TOptionSpreadTemplateLegCompareLogic;
	expiration?: TOptionSpreadTemplateLegCompareLogic;
}

export interface IOptionSpreadTemplateLeg {
	type: ETradeOptionType;
	strike_group: number;
	exp_group: number;
	quantity: number;
	quantity_multiplier: number;
	editable_fields: string[];
	compare_with_prev_leg?: IOptionSpreadTemplateLegCompare;
}

const callDebitSpread: IOptionSpreadTemplate = {
	name: 'call-debit-spread',
	label: 'Call Debit Spread',
	legs: [
		{
			type: ETradeOptionType.CALL,
			strike_group: 0,
			exp_group: 0,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: []
		},
		{
			type: ETradeOptionType.CALL,
			strike_group: 1,
			exp_group: 0,
			quantity: -1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '>',
				expiration: '='
			}
		}
	]
};

const putDebitSpread: IOptionSpreadTemplate = {
	name: 'put-debit-spread',
	label: 'Put Debit Spread',
	legs: [
		{
			type: ETradeOptionType.PUT,
			strike_group: 0,
			exp_group: 0,
			quantity: -1,
			quantity_multiplier: 1,
			editable_fields: []
		},
		{
			type: ETradeOptionType.PUT,
			strike_group: 1,
			exp_group: 0,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '>',
				expiration: '='
			}
		}
	]
};

const callCreditSpread: IOptionSpreadTemplate = {
	name: 'call-credit-spread',
	label: 'Call Credit Spread',
	legs: [
		{
			type: ETradeOptionType.CALL,
			strike_group: 0,
			exp_group: 0,
			quantity: -1,
			quantity_multiplier: 1,
			editable_fields: []
		},
		{
			type: ETradeOptionType.CALL,
			strike_group: 1,
			exp_group: 0,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '>',
				expiration: '='
			}
		}
	]
};

const putCreditSpread: IOptionSpreadTemplate = {
	name: 'put-credit-spread',
	label: 'Put Credit Spread',
	legs: [
		{
			type: ETradeOptionType.PUT,
			strike_group: 0,
			exp_group: 0,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: []
		},
		{
			type: ETradeOptionType.PUT,
			strike_group: 1,
			exp_group: 0,
			quantity: -1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '>',
				expiration: '='
			}
		}
	]
};

const straddle: IOptionSpreadTemplate = {
	name: 'straddle',
	label: 'Straddle',
	legs: [
		{
			type: ETradeOptionType.CALL,
			strike_group: 0,
			exp_group: 0,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: []
		},
		{
			type: ETradeOptionType.PUT,
			strike_group: 0,
			exp_group: 0,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '=',
				expiration: '='
			}
		}
	]
};

const strangle: IOptionSpreadTemplate = {
	name: 'strangle',
	label: 'Strangle',
	legs: [
		{
			type: ETradeOptionType.PUT,
			strike_group: 0,
			exp_group: 0,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: []
		},
		{
			type: ETradeOptionType.CALL,
			strike_group: 1,
			exp_group: 0,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '>',
				expiration: '='
			}
		}
	]
};

const ironCondor: IOptionSpreadTemplate = {
	name: 'iron-condor',
	label: 'Iron Condor',
	legs: [
		{
			type: ETradeOptionType.PUT,
			strike_group: 0,
			exp_group: 0,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: []
		},
		{
			type: ETradeOptionType.PUT,
			strike_group: 1,
			exp_group: 0,
			quantity: -1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '>',
				expiration: '='
			}
		},
		{
			type: ETradeOptionType.CALL,
			strike_group: 2,
			exp_group: 0,
			quantity: -1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '>',
				expiration: '='
			}
		},
		{
			type: ETradeOptionType.CALL,
			strike_group: 3,
			exp_group: 0,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '>',
				expiration: '='
			}
		}
	]
};

const calendarCallSpread: IOptionSpreadTemplate = {
	name: 'calendar-call-spread',
	label: 'Calendar Call Spread',
	legs: [
		{
			type: ETradeOptionType.CALL,
			strike_group: 0,
			exp_group: 0,
			quantity: -1,
			quantity_multiplier: 1,
			editable_fields: []
		},
		{
			type: ETradeOptionType.CALL,
			strike_group: 1,
			exp_group: 1,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '=',
				expiration: '>'
			}
		}
	]
};

const calendarPutSpread: IOptionSpreadTemplate = {
	name: 'calendar-put-spread',
	label: 'Calendar Put Spread',
	legs: [
		{
			type: ETradeOptionType.PUT,
			strike_group: 0,
			exp_group: 0,
			quantity: -1,
			quantity_multiplier: 1,
			editable_fields: []
		},
		{
			type: ETradeOptionType.PUT,
			strike_group: 1,
			exp_group: 1,
			quantity: 1,
			quantity_multiplier: 1,
			editable_fields: [],
			compare_with_prev_leg: {
				strike: '=',
				expiration: '>'
			}
		}
	]
};

export const optionSpreadTemplateGroups: IOptionSpreadTemplateGroup[] = [
	{
		groupName: 'Verticals',
		templates: [callDebitSpread, putDebitSpread, callCreditSpread, putCreditSpread]
	},
	{
		groupName: 'Directional',
		templates: [straddle, strangle]
	},
	{
		groupName: 'Neutral',
		templates: [ironCondor]
	},
	{
		groupName: 'Calendar',
		templates: [calendarCallSpread, calendarPutSpread]
	}
];

export const optionSpreadTemplatesMapByName = new Map(
	optionSpreadTemplateGroups.flatMap((group) => group.templates.map((tmpl) => [tmpl.name, tmpl]))
);
