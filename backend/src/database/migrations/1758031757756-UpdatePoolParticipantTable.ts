import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePoolParticipantTable1758031757756 implements MigrationInterface {
    name = 'UpdatePoolParticipantTable1758031757756'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_participants" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pool_participants" DROP COLUMN "created_at"`);
    }

}
