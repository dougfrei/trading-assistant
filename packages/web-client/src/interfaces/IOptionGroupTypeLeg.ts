import { ETradeSide } from '@trading-assistant/common/enums';
import EOptionGroupTypeLegEditable from '../enums/EOptionGroupTypeLegEditable';
import EOptionType from '../enums/EOptionType';

interface IOptionGroupTypeLeg {
	type: EOptionType;
	strikeGroup: number;
	expGroup: number;
	side: ETradeSide | null;
	quantity: number;
	editableFields: EOptionGroupTypeLegEditable[];
}

export default IOptionGroupTypeLeg;
