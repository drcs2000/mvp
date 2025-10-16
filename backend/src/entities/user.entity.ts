import typeorm, { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PoolParticipant } from './pool-participant.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'first_access', type: 'boolean', default: true })
  firstAccess!: boolean;

  @Column({ name: 'first_bet', type: 'boolean', default: true })
  firstBet!: boolean;

  @OneToMany(() => PoolParticipant, (participant) => participant.user)
  pools!: PoolParticipant[];
}
