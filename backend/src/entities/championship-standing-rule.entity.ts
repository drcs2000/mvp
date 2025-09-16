import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Championship } from './championship.entity';

@Entity('championship_standing_rules')
export class ChampionshipStandingRule {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Championship, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'championshipApiFootballId', referencedColumnName: 'apiFootballId' })
    championship!: Championship;

    @Column()
    championshipApiFootballId!: number;

    @Column()
    minRank!: number;

    @Column()
    maxRank!: number;

    @Column({ type: 'varchar', nullable: true })
    description!: string | null;
}
