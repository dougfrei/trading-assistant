import IScreenerRecord from 'src/interfaces/IScreenerRecord';

interface IScreenerResults {
	pagination: {
		currentPage: number;
		totalPages: number;
		perPage: number;
		totalRecords: number;
	};
	results: IScreenerRecord[];
}

export default IScreenerResults;
