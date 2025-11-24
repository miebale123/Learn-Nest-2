import type { ConfigType } from '@nestjs/config';
import type { configuration } from './app.config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { PoolConfig } from 'pg';

// const poolOptions: PoolConfig = {
//   max: 5,
//   connectionTimeoutMillis: 10000,
//   idleTimeoutMillis: 10000,
// };

export const typeOrmConfig = (
  config: ConfigType<typeof configuration>,
): TypeOrmModuleOptions => {
  if (!config) {
    throw new Error('config is missing!');
  }

  return {
    type: 'postgres',
    url: config.database.url,
    // host: config.database.host,
    // port: config.database.port,
    // username: config.database.user,
    // password: config.database.password,
    // database: config.database.name,
    synchronize: config.database.synchronize,
    logging: config.database.logging,
    autoLoadEntities: config.database.autoLoadEntities,
    ssl: {
      rejectUnauthorized: false, 
    },
    // extra: poolOptions,
    // retryAttempts: 5, 
    // retryDelay: 3000, 
  };
};
