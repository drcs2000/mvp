import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStandingsTable1758036567134 implements MigrationInterface {
    name = 'UpdateStandingsTable1758036567134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" DROP CONSTRAINT "FK_4baa014af5f6e6e8e8f371dcbbe"`);
        await queryRunner.query(`ALTER TABLE "standings" DROP COLUMN "championshipId"`);
        await queryRunner.query(`ALTER TABLE "standings" ADD CONSTRAINT "FK_5669042d7a70b7b61b347d60dde" FOREIGN KEY ("championshipApiFootballId") REFERENCES "championships"("api_football_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standings" DROP CONSTRAINT "FK_5669042d7a70b7b61b347d60dde"`);
        await queryRunner.query(`ALTER TABLE "standings" ADD "championshipId" integer`);
        await queryRunner.query(`ALTER TABLE "standings" ADD CONSTRAINT "FK_4baa014af5f6e6e8e8f371dcbbe" FOREIGN KEY ("championshipId") REFERENCES "championships"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
