import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    Unique
} from 'typeorm';
import { User } from './user.entity.js';
import { Pool } from './pool.entity.js';
import { Match } from './match.entity.js';

@Entity('bets')
@Unique(['user', 'pool', 'match'])
export class Bet {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    user!: User;

    @ManyToOne(() => Pool, { nullable: false, onDelete: 'CASCADE' })
    pool!: Pool;

    @ManyToOne(() => Match, { nullable: false, onDelete: 'CASCADE' })
    match!: Match;

    @Column({ name: 'home_score_bet' })
    homeScoreBet!: number;

    @Column({ name: 'away_score_bet' })
    awayScoreBet!: number;

    @Column({ name: 'points_earned', type: 'integer', nullable: true })
    pointsEarned!: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
