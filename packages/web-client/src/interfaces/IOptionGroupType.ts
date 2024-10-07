import IOptionGroupTypeLeg from './IOptionGroupTypeLeg';

interface IOptionGroupType {
	id: string;
	label: string;
	labelGroup?: string;
	legs: IOptionGroupTypeLeg[];
}

export default IOptionGroupType;
