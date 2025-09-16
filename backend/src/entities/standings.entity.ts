import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Unique,
    JoinColumn
} from 'typeorm';
import { Championship } from './championship.entity';

@Entity('standings')
@Unique(['championshipApiFootballId', 'teamApiId'])
export class Standings {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Championship, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'championshipApiFootballId', referencedColumnName: 'apiFootballId' })
    championship!: Championship;

    @Column()
    championshipApiFootballId!: number;

    @Column()
    teamApiId!: number;

    @Column()
    teamName!: string;

    @Column()
    teamLogoUrl!: string;

    @Column()
    rank!: number;

    @Column()
    points!: number;

    @Column()
    goalsDiff!: number;

    @Column({ type: 'varchar', length: 10, nullable: true })
    form!: string | null;

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

    @Column()
    goalsFor!: number;

    @Column()
    goalsAgainst!: number;

    @Column({ type: 'timestamptz' })
    lastUpdate!: Date;
}