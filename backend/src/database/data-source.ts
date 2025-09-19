import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Pool } from '../entities/pool.entity';
import { PoolParticipant } from '../entities/pool-participant.entity';
import { Match } from '../entities/match.entity'
import { Championship } from '../entities/championship.entity'
import { Standings } from '../entities/standings.entity'
import { Bet } from '../entities/bet.entity'
import { ChampionshipStandingRule } from '../entities/championship-standing-rule.entity'
import { Head2Head } from '../entities/h2h.entity'
import { Invitation } from '../entities/invitation.entity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  synchronize: false,
  logging: true,

  entities: [User, Pool, PoolParticipant, Match, Championship, Standings, Bet, ChampionshipStandingRule, Head2Head, Invitation],

  migrations: ["src/database/migrations/*.{ts,js}"],
});