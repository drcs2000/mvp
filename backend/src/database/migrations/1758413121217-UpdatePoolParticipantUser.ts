import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePoolParticipantUser1758413121217 implements MigrationInterface {
    name = 'UpdatePoolParticipantUser1758413121217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_participants" ADD "paid" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_participants" DROP COLUMN "paid"`);
    }

}
