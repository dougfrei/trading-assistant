import { EGqlOptionType } from './IGqlResponses';

interface IOptionEditorLegValues {
	optionType: EGqlOptionType;
	expiration: Date;
	strike: number;
	quantity: number;
}

export default IOptionEditorLegValues;
