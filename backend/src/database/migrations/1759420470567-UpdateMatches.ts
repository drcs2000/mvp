import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMatches1759420470567 implements MigrationInterface {
    name = 'UpdateMatches1759420470567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "round"`);
        await queryRunner.query(`ALTER TABLE "matches" ADD "round" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "round"`);
        await queryRunner.query(`ALTER TABLE "matches" ADD "round" integer`);
    }

}
