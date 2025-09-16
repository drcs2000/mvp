import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMatchTable1758058026522 implements MigrationInterface {
    name = 'UpdateMatchTable1758058026522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "espn_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "api_football_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "api_football_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "matches" ALTER COLUMN "espn_id" SET NOT NULL`);
    }

}
