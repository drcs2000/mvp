// src/database/data-source.ts

import 'reflect-metadata';
import 'dotenv/config';
import { types } from 'pg';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { Pool } from '../entities/pool.entity.js';
import { PoolParticipant } from '../entities/pool-participant.entity.js';
import { Match } from '../entities/match.entity.js';
import { Championship } from '../entities/championship.entity.js';
import { Standings } from '../entities/standings.entity.js';
import { Bet } from '../entities/bet.entity.js';
import { ChampionshipStandingRule } from '../entities/championship-standing-rule.entity.js';
import { HeadToHead } from '../entities/h2h.entity.js';
import { Invitation } from '../entities/invitation.entity.js';

types.setTypeParser(1114, (value) => new Date(`${value}Z`));

const defaultPoolMax = process.env.VERCEL ? 1 : 3;

export const AppDataSource = new DataSource({
  type: 'postgres',

  url: process.env.DATABASE_URL,

  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,

  extra: {
    max: Number(process.env.DB_POOL_MAX || defaultPoolMax),
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  },

  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',

  entities: [
    User,
    Pool,
    PoolParticipant,
    Match,
    Championship,
    Standings,
    Bet,
    ChampionshipStandingRule,
    HeadToHead,
    Invitation,
  ],

  migrations: ["src/database/migrations/*.{ts,js}"],
});
