import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PoolParticipant } from './pool-participant.entity';
import { Invitation } from './invitation.entity';
import { Championship } from './championship.entity';

interface IPointsSystem {
  full: number;
  partial: number;
  goal: number;
  result: number;
}

@Entity('pools')
export class Pool {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ name: 'max_participants' })
  maxParticipants!: number;

  @Column({ name: 'bet_deadline_hours' })
  betDeadlineHours!: number;

  @ManyToOne(() => Championship, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'base_championship_id' })
  baseChampionship!: Championship;

  @Column({ type: 'boolean', default: false })
  private!: boolean;

  @Column({
    type: 'jsonb',
  })
  points!: IPointsSystem;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'entry_fee',
  })
  entryFee!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => PoolParticipant, (participant) => participant.pool)
  participants!: PoolParticipant[];

  @OneToMany(() => Invitation, (invitation) => invitation.pool)
  invitations!: Invitation[];
}