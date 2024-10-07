import FMPClientService from 'src/data-sources/FMPClient.service';
import FMPCloudClientService from 'src/data-sources/FMPCloudClient.service';
import { getErrorObject } from '../errors';

export interface IFMPTickerSymbol {
	symbol: string;
	name: string;
	exchange: string;
	type: string;
	marketCap: number;
	avgVolume: number;
}

interface IFMPTickerSymbolManagerOpts {
	allowedExchanges: string[];
	allowedTypes: string[];
}

interface IFMPTickerSymbolManagerFilterOpts {
	avgVolume?: number;
	avgVolumeCompare?: '>' | '<' | '>=' | '<=';
	marketCap?: number;
	marketCapCompare?: '>' | '<' | '>=' | '<=';
	type?: '' | 'stock' | 'etf';
	exchange?: string;
	excludeSymbols?: string[];
}

class FMPTickerSymbolManager {
	protected tickerSymbols: IFMPTickerSymbol[] = [];
	protected readonly opts: IFMPTickerSymbolManagerOpts = {
		allowedExchanges: ['NYSE', 'NASDAQ', 'AMEX'],
		allowedTypes: ['stock', 'etf']
	};

	constructor(
		protected readonly fmpClientService: FMPClientService,
		protected readonly fmpCloudClientService: FMPCloudClientService,
		opts: Partial<IFMPTickerSymbolManagerOpts> = {}
	) {
		this.opts = {
			...this.opts,
			...opts
		};
	}

	public async init() {
		const tradableSymbols = await this.fmpCloudClientService.getTradableSymbols();

		const filteredTradableSymbols = tradableSymbols.filter(
			(symbol) =>
				this.opts.allowedExchanges.includes(symbol.exchangeShortName) &&
				this.opts.allowedTypes.includes(symbol.type)
		);

		/**
		 * Get symbols for each of the allowed exchanges
		 * - this data will include the average daily volume
		 */
		for (const exchange of this.opts.allowedExchanges) {
			try {
				const exchangeSymbols = await this.fmpClientService.getExchangeSymbols(exchange);

				exchangeSymbols.forEach((exchangeSymbol) => {
					const tradableSymbolMatch = filteredTradableSymbols.find(
						(tradableSymbol) => tradableSymbol.name === exchangeSymbol.name
					);
					const symbolType = tradableSymbolMatch ? tradableSymbolMatch.type : '';

					if (!symbolType) {
						return;
					}

					this.addTickerSymbol({
						symbol: exchangeSymbol.symbol,
						name: exchangeSymbol.name,
						exchange: exchangeSymbol.exchange,
						type: symbolType,
						marketCap: exchangeSymbol.marketCap ?? 0,
						avgVolume: exchangeSymbol.avgVolume ?? 0
					});
				});
			} catch (err: unknown) {
				const errObj = getErrorObject(
					err,
					`An error occurred while getting symbols for exchange: ${exchange}`
				);

				console.log(errObj.message);
			}
		}
	}

	public addTickerSymbol(tickerSymbol: IFMPTickerSymbol) {
		this.tickerSymbols.push(tickerSymbol);
	}

	public getAll(): IFMPTickerSymbol[] {
		return this.tickerSymbols;
	}

	public getBySymbol(symbol: string): IFMPTickerSymbol | null {
		return this.tickerSymbols.find((tickerSymbol) => tickerSymbol.symbol === symbol) ?? null;
	}

	public filterSymbols(opts: IFMPTickerSymbolManagerFilterOpts): IFMPTickerSymbol[] {
		opts = {
			avgVolume: 0,
			avgVolumeCompare: '>=',
			marketCap: 0,
			marketCapCompare: '>=',
			type: '',
			exchange: '',
			excludeSymbols: [],
			...opts
		};

		const filteredRecords = this.tickerSymbols.filter((tickerSymbol) => {
			if (opts.excludeSymbols?.includes(tickerSymbol.symbol.toUpperCase())) {
				return false;
			}

			if (opts.avgVolume) {
				switch (opts.avgVolumeCompare) {
					case '>=':
						if (!(tickerSymbol.avgVolume >= opts.avgVolume)) {
							return false;
						}
						break;

					case '>':
						if (!(tickerSymbol.avgVolume > opts.avgVolume)) {
							return false;
						}
						break;

					case '<=':
						if (!(tickerSymbol.avgVolume <= opts.avgVolume)) {
							return false;
						}
						break;

					case '<':
						if (!(tickerSymbol.avgVolume < opts.avgVolume)) {
							return false;
						}
						break;

					default:
						return false;
				}
			}

			if (opts.marketCap) {
				switch (opts.marketCapCompare) {
					case '>=':
						if (!(tickerSymbol.marketCap >= opts.marketCap)) {
							return false;
						}
						break;

					case '>':
						if (!(tickerSymbol.marketCap > opts.marketCap)) {
							return false;
						}
						break;

					case '<=':
						if (!(tickerSymbol.marketCap <= opts.marketCap)) {
							return false;
						}
						break;

					case '<':
						if (!(tickerSymbol.marketCap < opts.marketCap)) {
							return false;
						}
						break;

					default:
						return false;
				}
			}

			if (opts.type && tickerSymbol.type !== opts.type) {
				return false;
			}

			if (opts.exchange && tickerSymbol.exchange !== opts.exchange) {
				return false;
			}

			return true;
		});

		return filteredRecords;
	}
}

export default FMPTickerSymbolManager;
