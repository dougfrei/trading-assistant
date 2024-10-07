export interface IAlpacaBar {
	t: string;
	o: number;
	h: number;
	l: number;
	c: number;
	v: number;
	n: number;
	vw: number;
}

export interface IAlpacaMultiBarsResponse {
	bars: Record<string, IAlpacaBar[]>;
	next_page_token: string | null;
}
