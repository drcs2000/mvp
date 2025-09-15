import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMatchTable21757883834903 implements MigrationInterface {
    name = 'UpdateMatchTable21757883834903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "UQ_1a022d89e3cf9f35e814743e46e"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "api_match_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ADD "api_match_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "UQ_1a022d89e3cf9f35e814743e46e" UNIQUE ("api_match_id")`);
    }

}
