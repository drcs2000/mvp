import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStandings1759431080991 implements MigrationInterface {
    name = 'UpdateStandings1759431080991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" ADD "round" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" DROP COLUMN "round"`);
    }

}
