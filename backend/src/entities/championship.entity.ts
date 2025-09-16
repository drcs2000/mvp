import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, OneToMany } from 'typeorm';
import { ChampionshipStandingRule } from './championship-standing-rule.entity'; // Importe a nova entidade

export enum ChampionshipType {
  LEAGUE = 'League',
  CUP = 'Cup',
}

@Entity('championships')
export class Championship {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'api_football_id' })
  apiFootballId!: number;

  @Column({ name: 'api_espn_id', type: 'varchar', nullable: true })
  apiEspnId!: string | null;

  @Column({ name: 'api_espn_slug', type: 'varchar', nullable: true })
  apiEspnSlug!: string | null;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: ChampionshipType })
  type!: ChampionshipType;

  @Column({ name: 'league_logo_url' })
  leagueLogoUrl!: string;

  @Column({ name: 'country_name' })
  countryName!: string;

  @Column({ name: 'country_flag_url', type: 'varchar', nullable: true })
  countryFlagUrl!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => ChampionshipStandingRule, rule => rule.championship)
  standingRules!: ChampionshipStandingRule[];
}
