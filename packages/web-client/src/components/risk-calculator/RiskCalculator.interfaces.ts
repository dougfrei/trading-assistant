interface IRiskRewardLevel {
	multiplier: number;
	price: number;
}

export interface IRiskValuesTableData {
	riskPercentage: number;
	instrumentQuantity: number;
	buyingPowerNeeded: number;
	maxLoss: number;
	riskRewardLevels: IRiskRewardLevel[];
}
