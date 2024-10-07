import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config';
import { Logger } from 'nestjs-pino';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { AppModule } from 'src/app.module';
import { initAppBootstrapRequirements } from 'src/util/bootstrap';
import {
	getServerCORSallowOrigin,
	getServerCORSenabled,
	getServerHostname,
	getServerHttpsCertFilename,
	getServerHttpsKeyFilename,
	getServerPort
} from 'src/util/server';
import { AppGlobalsService } from './app-globals/appGlobals.service';

async function bootstrap() {
	await initAppBootstrapRequirements();

	const opts: NestApplicationOptions = {};
	const httpsKeyFile = getServerHttpsKeyFilename();
	const httpsCertFile = getServerHttpsCertFilename();

	if (httpsKeyFile && httpsCertFile) {
		opts.httpsOptions = {
			key: readFileSync(httpsKeyFile),
			cert: readFileSync(httpsCertFile)
		};
	}

	if (getServerCORSenabled()) {
		const corsOpts: CorsOptions = {
			credentials: true,
			allowedHeaders: [
				'Origin',
				'X-Requested-With',
				'Content-Type',
				'Accept',
				'Authorization',
				'X-Access-Token'
			],
			exposedHeaders: [
				'Origin',
				'X-Requested-With',
				'Content-Type',
				'Accept',
				'Authorization',
				'X-Access-Token'
			],
			methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
		};

		if (getServerCORSallowOrigin()) {
			corsOpts.origin = getServerCORSallowOrigin();
		}

		opts.cors = corsOpts;
	}

	const app = await NestFactory.create(AppModule, opts);

	app.get(AppGlobalsService).rootPath = resolvePath(__dirname, '..');

	app.use(cookieParser());
	app.useLogger(app.get(Logger));
	app.useGlobalPipes(new ValidationPipe());

	await app.listen(getServerPort(), getServerHostname(), async () => {
		const isHttps = getServerHttpsKeyFilename() && getServerHttpsCertFilename();
		const logger = app.get(Logger);

		logger.log(
			`server listening on: http${isHttps ? 's' : ''}://${getServerHostname()}:${getServerPort()}`
		);

		if (getServerCORSenabled()) {
			logger.log('CORS is enabled');

			if (getServerCORSallowOrigin()) {
				logger.log(`CORS allowed origin: ${getServerCORSallowOrigin()}`);
			}
		}
	});
}

bootstrap();
