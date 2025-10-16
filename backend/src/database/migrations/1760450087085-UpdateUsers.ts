import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsers1760450087085 implements MigrationInterface {
    name = 'UpdateUsers1760450087085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "first_access" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "first_bet" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_bet"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_access"`);
    }

}
