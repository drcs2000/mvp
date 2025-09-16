import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStandingRulesTable1758037811925 implements MigrationInterface {
    name = 'CreateStandingRulesTable1758037811925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "championship_standing_rules" ("id" SERIAL NOT NULL, "championshipApiFootballId" integer NOT NULL, "minRank" integer NOT NULL, "maxRank" integer NOT NULL, "description" character varying, CONSTRAINT "PK_0cf7ef62a82639290b39d35ac3c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "championship_standing_rules" ADD CONSTRAINT "FK_974f0493cb1bb0c7f945b1a4c8a" FOREIGN KEY ("championshipApiFootballId") REFERENCES "championships"("api_football_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "championship_standing_rules" DROP CONSTRAINT "FK_974f0493cb1bb0c7f945b1a4c8a"`);
        await queryRunner.query(`DROP TABLE "championship_standing_rules"`);
    }

}
