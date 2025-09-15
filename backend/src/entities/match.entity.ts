import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum MatchStatus {
    SCHEDULED = 'TBD', // To Be Defined
    NOT_STARTED = 'NS', // Not Started
    IN_PLAY_1ST_HALF = '1H',
    IN_PLAY_2ND_HALF = '2H',
    HALF_TIME = 'HT',
    FINISHED = 'FT', // Finished
    POSTPONED = 'PST',
    CANCELLED = 'CANC',
}

@Entity('matches')
export class Match {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'espn_id' })
    espnId!: number;

    @Column({ name: 'api_football_id' })
    apiFootballId!: number;

    @Column({ name: 'api_football_fixture_id', unique: true })
    apiFootballFixtureId!: number;

    @Index()
    @Column()
    date!: Date;

    @Column()
    stadium!: string;
    
    @Column({ name: 'home_team_name' })
    homeTeamName!: string;
    
    @Column({ name: 'home_team_logo_url' })
    homeTeamLogoUrl!: string;

    @Column({ name: 'away_team_name' })
    awayTeamName!: string;

    @Column({ name: 'away_team_logo_url' })
    awayTeamLogoUrl!: string;

    @Column({ name: 'home_score', type: 'int', nullable: true })
    homeScore?: number;

    @Column({ name: 'away_score', type: 'int', nullable: true })
    awayScore?: number;

    @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.SCHEDULED })
    status!: MatchStatus;

    @Column({ nullable: true })
    round!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
