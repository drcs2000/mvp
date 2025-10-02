import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Championship } from './championship.entity';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  HALFTIME = 'HALFTIME',
  FULL_TIME = 'FULL_TIME',
  FINAL = 'FINAL',
  POSTPONED = 'POSTPONED',
  CANCELED = 'CANCELED',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Championship, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'championship_id' })
  championship!: Championship;

  @Index({ unique: true })
  @Column({ name: 'api_espn_id' })
  apiEspnId!: number;

  @Index()
  @Column()
  date!: Date;

  @Column({ name: 'venue_name', type: 'varchar', nullable: true })
  venueName!: string | null;

  @Column({ name: 'venue_city', type: 'varchar', nullable: true })
  venueCity!: string | null;

  @Column({ name: 'home_team_espn_id' })
  homeTeamEspnId!: number;

  @Column({ name: 'home_team_name', type: 'varchar' })
  homeTeamName!: string;

  @Column({ name: 'home_team_logo_url', type: 'varchar' })
  homeTeamLogoUrl!: string;

  @Column({ name: 'away_team_espn_id' })
  awayTeamEspnId!: number;

  @Column({ name: 'away_team_name', type: 'varchar' })
  awayTeamName!: string;

  @Column({ name: 'away_team_logo_url', type: 'varchar' })
  awayTeamLogoUrl!: string;

  @Column({ name: 'home_score', type: 'int', nullable: true })
  homeScore?: number | null;

  @Column({ name: 'away_score', type: 'int', nullable: true })
  awayScore?: number | null;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.SCHEDULED })
  status!: MatchStatus;

  @Column({ name: 'api_espn_status_detail', type: 'varchar', nullable: true })
  apiEspnStatusDetail!: string | null;

  @Column({ type: 'varchar', nullable: true })
  round!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}