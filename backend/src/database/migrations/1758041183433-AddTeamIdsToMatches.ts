import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeamIdsToMatches1758041183433 implements MigrationInterface {
    name = 'AddTeamIdsToMatches1758041183433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" ALTER COLUMN "form" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" ALTER COLUMN "form" SET NOT NULL`);
    }

}
