import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Unique,
    JoinColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Championship } from './championship.entity';

@Entity('standings')
@Unique(['championship', 'teamEspnId'])
export class Standings {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Championship, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'championship_id' })
    championship!: Championship;

    @Column({ name: 'team_espn_id' })
    teamEspnId!: number;

    @Column({ name: 'team_name' })
    teamName!: string;

    @Column({ name: 'team_logo_url' })
    teamLogoUrl!: string;

    @Column()
    rank!: number;

    @Column()
    points!: number;

    @Column({ name: 'goals_diff' })
    goalsDiff!: number;

    @Column({ type: 'varchar', length: 10, nullable: true })
    form!: string | null;

    @Column({ type: 'varchar', nullable: true })
    round!: string | null;

    @Column({ type: 'varchar', nullable: true })
    description!: string | null;

    @Column()
    played!: number;

    @Column()
    win!: number;

    @Column()
    draw!: number;

    @Column()
    lose!: number;

    @Column({ name: 'goals_for' })
    goalsFor!: number;

    @Column({ name: 'goals_against' })
    goalsAgainst!: number;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}