import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity.js';
import { Pool } from './pool.entity.js';

export enum InvitationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    EXPIRED = 'expired',
    DECLINED = 'declined',
    CANCELED = 'canceled',
}

@Entity('invitations')
export class Invitation {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, nullable: true })
    token?: string;

    @Column({
        type: 'enum',
        enum: InvitationStatus,
        default: InvitationStatus.PENDING,
    })
    status!: InvitationStatus;

    @Column({ name: 'expires_at' })
    expiresAt!: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @ManyToOne(() => Pool, (pool) => pool.invitations, { eager: true })
    @JoinColumn({ name: 'pool_id' })
    pool!: Pool;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'inviter_id' })
    inviter!: User;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'invitee_id' })
    invitee!: User;
}