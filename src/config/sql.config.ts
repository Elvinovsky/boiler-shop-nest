import { registerAs } from '@nestjs/config';
import { Dialect } from 'sequelize';
import * as process from 'process';
export const sqlConfig = registerAs('database', () => ({
  dialect: <Dialect>process.env.SQL_DIALECT || 'postgres',
  logging: process.env.SQL_LOGGING === 'true',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  autoLoadEntities: true,
  synchronize: true,
}));
