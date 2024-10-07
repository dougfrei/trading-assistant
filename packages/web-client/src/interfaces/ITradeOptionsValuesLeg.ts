import { EGqlSide } from './IGqlResponses';

interface ITradeOptionsValuesLeg {
	side: EGqlSide | null;
	expiration: Date;
	strike: number | null;
	quanitity: number;
}

export default ITradeOptionsValuesLeg;
