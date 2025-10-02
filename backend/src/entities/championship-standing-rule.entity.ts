import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Championship } from './championship.entity';

@Entity('championship_standing_rules')
export class ChampionshipStandingRule {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Championship, (championship) => championship.standingRules, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'championship_id' })
    championship!: Championship;

    @Column({ name: 'min_rank' })
    minRank!: number;

    @Column({ name: 'max_rank' })
    maxRank!: number;

    @Column({ type: 'varchar', nullable: true })
    description!: string | null;
}
