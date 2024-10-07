import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

const redisHost = process.env.REDIS_HOST ?? 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT ?? '6379');

export default [
	/**
	 * Cache
	 */
	CacheModule.register({
		isGlobal: true,
		store: redisStore,
		host: redisHost,
		port: redisPort
	}),
	/**
	 * Redis
	 */
	BullModule.forRoot({
		redis: {
			host: redisHost,
			port: redisPort
		}
	})
];
