import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMatchTable1759345080926 implements MigrationInterface {
    name = 'UpdateMatchTable1759345080926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "round"`);
        await queryRunner.query(`ALTER TABLE "matches" ADD "round" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "round"`);
        await queryRunner.query(`ALTER TABLE "matches" ADD "round" character varying`);
    }

}
