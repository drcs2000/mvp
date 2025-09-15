import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMatchTable41757894699380 implements MigrationInterface {
    name = 'UpdateMatchTable41757894699380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ADD "round" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "round"`);
    }

}
