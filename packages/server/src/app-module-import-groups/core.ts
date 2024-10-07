import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from 'src/db/db.module';
import { envSchema } from 'src/env/env';
import { EnvModule } from 'src/env/env.module';
import { getServerHostname } from 'src/util/server';
import * as v from 'valibot';

export default [
	ConfigModule.forRoot({
		isGlobal: true,
		validate: (env) => v.parse(envSchema, env)
	}),
	EnvModule,
	DatabaseModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (configService: ConfigService) => ({
			host: configService.get('POSTGRES_DB_HOST') ?? '',
			port: configService.get('POSTGRES_DB_PORT') ?? 0,
			user: configService.get('POSTGRES_DB_USER') ?? '',
			password: configService.get('POSTGRES_DB_PASS') ?? '',
			database: configService.get('POSTGRES_DB_NAME') ?? ''
		})
	}),
	LoggerModule.forRoot({
		pinoHttp: {
			autoLogging: false,
			transport: {
				target: 'pino-pretty',
				options: {
					colorize: true,
					singleLine: true
				}
			}
		}
	}),
	MailerModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (configService: ConfigService) => ({
			transport: {
				host: configService.get('SMTP_HOST') ?? '',
				port: configService.get('SMTP_PORT') ?? 0,
				secure: configService.get('SMTP_SECURE') ?? false,
				auth: {
					user: configService.get('SMTP_AUTH_USER') ?? '',
					pass: configService.get('SMTP_AUTH_PASS') ?? ''
				}
			},
			defaults: {
				from: `Trading Admin <admin@${getServerHostname()}>`
			}
		})
	})
];
