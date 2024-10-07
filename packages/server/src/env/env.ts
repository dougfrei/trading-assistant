import * as v from 'valibot';

const coerceString = v.pipe(v.unknown(), v.transform(String));
const coerceNumber = v.pipe(v.unknown(), v.transform(Number));
const coerceBoolean = v.pipe(v.unknown(), v.transform(Boolean));

export const envSchema = v.object({
	SERVER_HOSTNAME: coerceString,
	SERVER_PORT: v.optional(v.pipe(v.unknown(), v.transform(Number), v.minValue(1)), 3000),
	SERVER_HTTPS_CERT_FILE: v.optional(coerceString, ''),
	SERVER_HTTPS_KEY_FILE: v.optional(coerceString, ''),
	SERVER_ENABLE_CORS: v.optional(coerceBoolean, false),
	SERVER_CORS_ALLOW_ORIGIN: v.optional(coerceString, ''),

	FRONTEND_URL: coerceString,

	SMTP_HOST: coerceString,
	SMTP_PORT: coerceNumber,
	SMTP_SECURE: coerceNumber,
	SMTP_AUTH_USER: coerceString,
	SMTP_AUTH_PASS: coerceString,

	AUTH_ACCESS_TOKEN_SECRET: coerceString,
	AUTH_REFRESH_TOKEN_SECRET: coerceString,
	AUTH_ACCESS_TOKEN_EXPIRE_MINUTES: v.optional(coerceNumber, 5),
	AUTH_REFRESH_TOKEN_EXPIRE_MINUTES: v.optional(coerceNumber, 10080),

	RESET_PASSWORD_ID_EXPIRE_MINUTES: v.optional(coerceNumber, 15),

	POSTGRES_DB_HOST: coerceString,
	POSTGRES_DB_PORT: coerceNumber,
	POSTGRES_DB_USER: coerceString,
	POSTGRES_DB_PASS: coerceString,
	POSTGRES_DB_NAME: coerceString,

	REDIS_HOST: coerceString,
	REDIS_PORT: coerceNumber,

	FMP_API_KEY: coerceString,
	FMP_CLOUD_API_KEY: coerceString,

	POLYGON_API_KEY: coerceString,

	ALPACA_API_KEY: coerceString,
	ALPACA_API_SECRET: coerceString
});

export type Env = v.InferOutput<typeof envSchema>;
