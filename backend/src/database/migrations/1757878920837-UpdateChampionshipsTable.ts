import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChampionshipsTable1757878920837 implements MigrationInterface {
    name = 'UpdateChampionshipsTable1757878920837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "championships" ADD "api_espn_slug" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "championships" DROP COLUMN "api_espn_slug"`);
    }

}
