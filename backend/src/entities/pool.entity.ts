import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PoolParticipant } from './pool-participant.entity';

interface IPointsSystem {
  full: number;
  partial: number;
  goal: number;
  result: number;
}

@Entity('pools')
export class Pool {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ name: 'max_participants' })
  maxParticipants!: number;

  @Column({ name: 'bet_deadline_hours' })
  betDeadlineHours!: number;

  @Column({ name: 'base_championship_id' })
  baseChampionshipId!: number;

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
    name: 'entry_fee'
  })
  entryFee!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => PoolParticipant, (participant) => participant.pool)
  participants!: PoolParticipant[];
}

