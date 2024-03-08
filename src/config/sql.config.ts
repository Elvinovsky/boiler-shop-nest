import { registerAs } from '@nestjs/config';
import { Dialect } from 'sequelize';
import * as process from 'process';
import mysql2 from 'mysql2';
export const sqlConfig = registerAs('database', () => ({
  dialect: <Dialect>process.env.SQL_DIALECT || 'mysql',
  dialectModule: mysql2,
  logging: process.env.SQL_LOGGING === 'true',
  host: process.env.DATABASE_HOST || 'sql.freedb.tech',
  port: Number(process.env.DATABASE_PORT) || 3306,
  username: process.env.DATABASE_USER || 'freedb_elvin',
  password: process.env.DATABASE_PASSWORD || '7rq3S&&gaXqF7C@',
  database: process.env.DATABASE_NAME || 'freedb_boiler_shop',
  autoLoadEntities: false,
  synchronize: true,
  ssl: { rejectUnauthorized: false },
}));
