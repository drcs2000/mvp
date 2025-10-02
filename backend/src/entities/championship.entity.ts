import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, UpdateDateColumn, OneToMany } from 'typeorm';
import { ChampionshipStandingRule } from './championship-standing-rule.entity';

export enum ChampionshipType {
  LEAGUE = 'League',
  CUP = 'Cup',
}

export enum CalendarType {
  BRASILEIRO = 'brasileiro',
  EUROPEU = 'europeu',
}

@Entity('championships')
export class Championship {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'api_espn_id', type: 'int', nullable: true, unique: true })
  apiEspnId!: number | null;

  @Column({ type: 'enum', enum: CalendarType, default: CalendarType.BRASILEIRO })
  calendar!: CalendarType;

  @Index({ unique: true })
  @Column({ name: 'api_espn_slug', type: 'varchar' })
  apiEspnSlug!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  abbreviation!: string | null;

  @Column({ type: 'enum', enum: ChampionshipType })
  type!: ChampionshipType;

  @Column({ name: 'logo_url' })
  logoUrl!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ChampionshipStandingRule, rule => rule.championship)
  standingRules!: ChampionshipStandingRule[];
}
