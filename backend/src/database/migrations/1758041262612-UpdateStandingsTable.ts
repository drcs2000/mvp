import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStandingsTable1758041262612 implements MigrationInterface {
    name = 'UpdateStandingsTable1758041262612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" ALTER COLUMN "form" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" ALTER COLUMN "form" DROP NOT NULL`);
    }

}
