import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import type { User } from './user.entity.js';
import type { Pool } from './pool.entity.js';

export enum PoolRole {
  ADMIN = 'admin',
  PARTICIPANT = 'participant',
}

@Entity('pool_participants')
export class PoolParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'pool_id' })
  poolId!: number;

  @Column({
    type: 'enum',
    enum: PoolRole,
    default: PoolRole.PARTICIPANT,
  })
  role!: PoolRole;

  @Column({ type: 'boolean', default: false })
  paid!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @ManyToOne('User', (user: User) => user.pools)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne('Pool', (pool: Pool) => pool.participants)
  @JoinColumn({ name: 'pool_id' })
  pool!: Pool;
}