import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export interface IH2HMatch {
  apiEspnId: number;
  date: string;
  homeTeamEspnId: number;
  awayTeamEspnId: number;
  homeScore: number;
  awayScore: number;
  venue?: string | null;
}

export interface IH2HSummary {
  team1Wins: number;
  team2Wins: number;
  draws: number;
  totalMatches: number;
}

@Entity('h2h')
@Unique(['team1EspnId', 'team2EspnId'])
export class HeadToHead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'team_1_espn_id' })
  team1EspnId!: number;

  @Column({ name: 'team_2_espn_id' })
  team2EspnId!: number;

  @Column({ type: 'jsonb' })
  matches!: IH2HMatch[];

  @Column({ type: 'jsonb' })
  summary!: IH2HSummary;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  orderTeamIds() {
    if (this.team1EspnId > this.team2EspnId) {
      const tempId = this.team1EspnId;
      this.team1EspnId = this.team2EspnId;
      this.team2EspnId = tempId;
    }
  }
}