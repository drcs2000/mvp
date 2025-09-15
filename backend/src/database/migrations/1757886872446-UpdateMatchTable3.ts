import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMatchTable31757886872446 implements MigrationInterface {
    name = 'UpdateMatchTable31757886872446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ADD "api_football_fixture_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "UQ_5e7d5f2d0ade7b773af24ef70ae" UNIQUE ("api_football_fixture_id")`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "UQ_d9efdebc5eb2eb1611eca8ad688"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "UQ_1ac1c354ae792ff4efa93071bb1"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "UQ_1ac1c354ae792ff4efa93071bb1" UNIQUE ("api_football_id")`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "UQ_d9efdebc5eb2eb1611eca8ad688" UNIQUE ("espn_id")`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "UQ_5e7d5f2d0ade7b773af24ef70ae"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "api_football_fixture_id"`);
    }

}
