import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { Match } from './match.entity'; // Importa a entidade Match

@Entity('h2h')
@Unique(['team1Id', 'team2Id']) 
export class Head2Head {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  team1Id!: number;

  @Column()
  team2Id!: number;

  @Column('jsonb') 
  matches!: Match[]; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated!: Date;
}