import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Pool } from '../entities/pool.entity';
import { PoolParticipant } from '../entities/pool-participant.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  
  synchronize: false,
  logging: true, 
  
  entities: [User, Pool, PoolParticipant], 

  migrations: ["src/database/migrations/*.{ts,js}"], 
});