import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStandingsTable21758041277382 implements MigrationInterface {
    name = 'UpdateStandingsTable21758041277382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" ALTER COLUMN "form" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" ALTER COLUMN "form" SET NOT NULL`);
    }

}
