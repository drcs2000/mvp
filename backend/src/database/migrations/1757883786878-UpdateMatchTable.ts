import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMatchTable1757883786878 implements MigrationInterface {
    name = 'UpdateMatchTable1757883786878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ADD "espn_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "UQ_d9efdebc5eb2eb1611eca8ad688" UNIQUE ("espn_id")`);
        await queryRunner.query(`ALTER TABLE "matches" ADD "api_football_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "UQ_1ac1c354ae792ff4efa93071bb1" UNIQUE ("api_football_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "UQ_1ac1c354ae792ff4efa93071bb1"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "api_football_id"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "UQ_d9efdebc5eb2eb1611eca8ad688"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "espn_id"`);
    }

}
