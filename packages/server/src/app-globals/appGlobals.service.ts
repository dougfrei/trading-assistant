import { Injectable } from '@nestjs/common';

@Injectable()
export class AppGlobalsService {
	protected _rootPath = '';

	set rootPath(value: string) {
		this._rootPath = value.trim();
	}

	get rootPath() {
		if (!this._rootPath) {
			throw new Error(
				'rootPath on AppGlobalsService has not been set or was accessed before it was available'
			);
		}

		return this._rootPath;
	}
}
