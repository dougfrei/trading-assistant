import { ComboboxItem, ComboboxItemGroup } from '@mantine/core';
import {
	EGqlOptionType,
	IGqlTradeOptionSpreadTemplate,
	IGqlTradeOptionSpreadTemplateGroup,
	IGqlTradeOptionSpreadTemplateLeg
} from '@src/interfaces/IGqlResponses';
import IOptionEditorLegValues from '@src/interfaces/IOptionEditorLegValues';
import { endOfWeek } from 'date-fns';

export function getInitialOptionSpreadLegs(
	spreadTemplates: IGqlTradeOptionSpreadTemplate[],
	selectedSpreadTemplate: string
): IOptionEditorLegValues[] {
	if (!selectedSpreadTemplate) {
		return [getDefaultOptionLegValues()];
	}

	const activeType = spreadTemplates.find((tmpl) => tmpl.name === selectedSpreadTemplate);

	if (!activeType || typeof activeType.legs === 'undefined' || !Array.isArray(activeType.legs)) {
		return [];
	}

	// set the "weekStartsOn" value to 6 (Saturday) so that the next possible Friday
	// is selected
	const expDate = endOfWeek(new Date(), { weekStartsOn: 6 });

	const legs = activeType.legs.map<IOptionEditorLegValues>((leg) => {
		return {
			optionType: leg.type,
			expiration: expDate,
			strike: 0,
			quantity: leg.quantity
		};
	});

	return legs;
}

export function getDefaultOptionLegValues(): IOptionEditorLegValues {
	return {
		optionType: EGqlOptionType.CALL,
		expiration: endOfWeek(new Date(), { weekStartsOn: 6 }),
		strike: 0,
		quantity: 1
	};
}

/**
 * Update the specified leg expiration date by key and additionally update any
 * grouped legs with the same value
 */
export function updateLegExpiration(
	sourceLegIndex: number,
	newExpDate: Date,
	legValues: IOptionEditorLegValues[],
	legTemplates: IGqlTradeOptionSpreadTemplateLeg[] = []
) {
	if (legValues.length && legTemplates.length) {
		const relatedLegsIndicies = legValues.reduce<Set<number>>((acum, leg, index) => {
			if (
				legTemplates[index]?.expirationGroup ===
					legTemplates[sourceLegIndex]?.expirationGroup &&
				index !== sourceLegIndex
			) {
				acum.add(index);
			}

			return acum;
		}, new Set());

		const newLegValues = legValues.map((leg, index) => {
			if (index === sourceLegIndex || relatedLegsIndicies.has(index)) {
				leg.expiration = newExpDate;
			}

			return leg;
		});

		return newLegValues;
	} else {
		return legValues.with(sourceLegIndex, {
			...legValues[sourceLegIndex],
			expiration: newExpDate
		});
	}
}

/**
 * Update the specified leg strike date by key and additionally update any
 * grouped legs with the same value
 */
export function updateLegStrike(
	sourceLegIndex: number,
	newStrike: number,
	legValues: IOptionEditorLegValues[],
	legTemplates: IGqlTradeOptionSpreadTemplateLeg[] = []
) {
	if (legValues.length && legTemplates.length) {
		const relatedLegsIndicies = legValues.reduce<Set<number>>((acum, leg, index) => {
			if (
				legTemplates[index]?.strikeGroup === legTemplates[sourceLegIndex]?.strikeGroup &&
				index !== sourceLegIndex
			) {
				acum.add(index);
			}

			return acum;
		}, new Set());

		const newLegValues = legValues.map((leg, index) => {
			if (index === sourceLegIndex || relatedLegsIndicies.has(index)) {
				leg.strike = newStrike;
			}

			return leg;
		});

		return newLegValues;
	} else {
		return legValues.with(sourceLegIndex, {
			...legValues[sourceLegIndex],
			strike: newStrike
		});
	}
}

export function validateOptionLegExpirationValue(
	allLegs: IOptionEditorLegValues[],
	rowIndex: number,
	template: IGqlTradeOptionSpreadTemplate
): [boolean, string] {
	if (rowIndex < 1 || allLegs.length < 2) {
		return [true, ''];
	}

	const compareOperator = template.legs[rowIndex]?.compareWithPreviousLeg?.expiration ?? '';

	if (!compareOperator) {
		return [true, ''];
	}

	const curExpiration = allLegs[rowIndex].expiration.getTime();
	const prevExpiration = allLegs[rowIndex - 1].expiration.getTime();

	switch (compareOperator) {
		case '<':
			if (curExpiration >= prevExpiration) {
				return [false, 'Must be less than the previous leg'];
			}
			break;

		case '<=':
			if (curExpiration > prevExpiration) {
				return [false, 'Must be less than or equal to the previous leg'];
			}
			break;

		case '=':
			if (curExpiration !== prevExpiration) {
				return [false, 'Must be equal to the previous leg'];
			}
			break;

		case '>=':
			if (curExpiration < prevExpiration) {
				return [false, 'Must be greater than or equal to the previous leg'];
			}
			break;

		case '>':
			if (curExpiration <= prevExpiration) {
				return [false, 'Must be greater than the previous leg'];
			}
			break;

		default:
			return [false, `invalid comparision operator: ${compareOperator}`];
	}

	return [true, ''];
}

export function validateOptionLegStrikeValue(
	allLegs: IOptionEditorLegValues[],
	rowIndex: number,
	template: IGqlTradeOptionSpreadTemplate
): [boolean, string] {
	if (rowIndex < 1 || allLegs.length < 2) {
		return [true, ''];
	}

	const compareOperator = template.legs[rowIndex]?.compareWithPreviousLeg?.strike ?? '';

	if (!compareOperator) {
		return [true, ''];
	}

	const curStrike = allLegs[rowIndex].strike;
	const prevStrike = allLegs[rowIndex - 1].strike;

	if (curStrike === null || prevStrike === null) {
		return [true, ''];
	}

	switch (compareOperator) {
		case '<':
			if (curStrike >= prevStrike) {
				return [false, 'Must be less than the previous leg'];
			}
			break;

		case '<=':
			if (curStrike > prevStrike) {
				return [false, 'Must be less than or equal to the previous leg'];
			}
			break;

		case '=':
			if (curStrike !== prevStrike) {
				return [false, 'Must be equal to the previous leg'];
			}
			break;

		case '>=':
			if (curStrike < prevStrike) {
				return [false, 'Must be greater than or equal to the previous leg'];
			}
			break;

		case '>':
			if (curStrike <= prevStrike) {
				return [false, 'Must be greater than the previous leg'];
			}
			break;

		default:
			return [false, `invalid comparision operator: ${compareOperator}`];
	}

	return [true, ''];
}

export function createOptionSpreadTemplateComboboxGroups(
	optionSpreadTemplateGroups: IGqlTradeOptionSpreadTemplateGroup[]
) {
	const groupItems = optionSpreadTemplateGroups.map<ComboboxItemGroup<ComboboxItem>>((group) => {
		return {
			group: group.groupName,
			items: group.templates.map((tmpl) => ({
				value: tmpl.name,
				label: tmpl.label
			}))
		};
	});

	return groupItems;
}
