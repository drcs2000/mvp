import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm'

export enum MatchStatus {
    SCHEDULED = 'TBD',
    NOT_STARTED = 'NS',
    IN_PLAY_1ST_HALF = '1H',
    IN_PLAY_2ND_HALF = '2H',
    HALF_TIME = 'HT',
    FINISHED = 'FT',
    POSTPONED = 'PST',
    CANCELLED = 'CANC',
    ABANDONED = 'ABD',
    PENALTY_SHOOTOUT = 'PEN',
    AFTER_EXTRA_TIME = 'AET',
}

@Entity('matches')
export class Match {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ name: 'espn_id', nullable: true })
    espnId!: number

    @Column({ name: 'api_football_id', nullable: true })
    apiFootballId!: number

    @Column({ name: 'api_football_fixture_id', unique: true })
    apiFootballFixtureId!: number

    @Index()
    @Column()
    date!: Date

    @Column({ nullable: true, default: 'Não declarado' })
    stadium!: string

    @Column({ name: 'home_team_api_id', type: 'int', nullable: true })
    homeTeamApiId!: number | null

    @Column({ name: 'home_team_name' })
    homeTeamName!: string

    @Column({ name: 'home_team_logo_url' })
    homeTeamLogoUrl!: string

    @Column({ name: 'away_team_api_id', type: 'int', nullable: true })
    awayTeamApiId!: number | null

    @Column({ name: 'away_team_name' })
    awayTeamName!: string

    @Column({ name: 'away_team_logo_url' })
    awayTeamLogoUrl!: string

    @Column({ name: 'home_score', type: 'int', nullable: true })
    homeScore?: number | null

    @Column({ name: 'away_score', type: 'int', nullable: true })
    awayScore?: number | null

    @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.SCHEDULED })
    status!: MatchStatus

    @Column({ nullable: true })
    round!: string

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date
}