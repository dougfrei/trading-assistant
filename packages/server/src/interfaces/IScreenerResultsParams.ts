import { ECandlePeriodType } from '@trading-assistant/common';
import EScreenerSortMethod from 'src/enums/EScreenerSortMethod';

interface IScreenerResultsParams {
	periodType?: ECandlePeriodType;
	page?: number;
	perPage?: number;
	date?: string;
	sort?: EScreenerSortMethod;
	sectorGCIS?: string;
	queryId?: number;
}

export default IScreenerResultsParams;
